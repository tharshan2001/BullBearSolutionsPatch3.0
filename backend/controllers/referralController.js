import User from '../models/User.js';
import mongoose from 'mongoose';

export const getFullReferralGraph = async (userId) => {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return { nodes: [], edges: [] };
  }

  try {
    const objectUserId = new mongoose.Types.ObjectId(userId);

    const results = await User.aggregate([
      { $match: { _id: objectUserId } },

      {
        $graphLookup: {
          from: 'users',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'referredBy',
          as: 'descendants',
          depthField: 'descendantDepth'
        }
      },

      {
        $project: {
          _id: 1,
          fullName: 1,
          email: 1,
          referredBy: 1,
          sales: 1,           
          descendants: 1
        }
      }
    ]);

    if (!results || results.length === 0) {
      return { nodes: [], edges: [] };
    }

    const rootUser = results[0];

    const combinedUsers = [rootUser, ...rootUser.descendants];

    const uniqueUsersMap = new Map();
    combinedUsers.forEach(user => {
      uniqueUsersMap.set(user._id.toString(), user);
    });
    const uniqueUsers = Array.from(uniqueUsersMap.values());

    // Build nodes with sales details
    const nodes = uniqueUsers.map(user => ({
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      parent: user._id.equals(objectUserId) ? null : (user.referredBy ? user.referredBy.toString() : null),
      sales: user.sales || { personalSales: 0, directSponsorSales: 0, groupSales: 0 }
    }));

    // Build edges for descendants only
    const edges = uniqueUsers
      .filter(user => user.referredBy && !user._id.equals(objectUserId))
      .map(user => ({
        from: user.referredBy.toString(),
        to: user._id.toString()
      }));

    return { nodes, edges };
  } catch (error) {
    console.error('Error in getFullReferralGraph:', error);
    return { nodes: [], edges: [] };
  }
};

export const getReferralGraphHandler = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const graph = await getFullReferralGraph(userId);

    res.json({
      success: true,
      data: {
        nodes: graph.nodes,
        edges: graph.edges,
        count: graph.nodes.length
      }
    });
  } catch (error) {
    console.error('Error in referral graph handler:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate referral graph',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
