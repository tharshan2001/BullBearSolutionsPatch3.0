import mongoose from 'mongoose';
import User from '../models/User.js';
import { getUplinerChain } from './chainOfUsers.js';

/**
 * Add sales amount to user and upliners.
 * @param {String} userId - ID of the user making the sale
 * @param {Number} amount - Sale amount
 * @returns {Promise<void>}
 */
export const addUserSales = async (userId, amount) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid userId');
  }

  try {
    // 1️⃣ Update user's personal sales
    await User.findByIdAndUpdate(
      userId,
      {
        $inc: { 'sales.personalSales': amount },
        'wallet.lastUpdated': new Date(),
      }
    );

    // 2️⃣ Get upliner chain
    const uplinerChain = await getUplinerChain(userId);

    for (const upliner of uplinerChain) {
      if (!mongoose.Types.ObjectId.isValid(upliner.userId)) continue;

      if (upliner.gen === 0) {
        // Direct sponsor
        await User.findByIdAndUpdate(
          upliner.userId,
          {
            $inc: { 'sales.directSponsorSales': amount },
            'wallet.lastUpdated': new Date(),
          }
        );
      } else {
        // Other upliners
        await User.findByIdAndUpdate(
          upliner.userId,
          {
            $inc: { 'sales.groupSales': amount },
            'wallet.lastUpdated': new Date(),
          }
        );
      }
    }
  } catch (error) {
    console.error('Error in addUserSales:', error);
    throw error;
  }
};
