import mongoose from 'mongoose';
import User from '../models/User.js';

/**
 * Get upliners for commission distribution.
 * - First upliner is direct upliner (or root user if no upliner found).
 * - Next upliners up to maxLevels are gen upliners (gen starts from 1).
 * - Max 20 gens.
 * 
 * @param {String} userId - starting user's ID
 * @param {Number} [maxLevels=20] - maximum gens to collect
 * @returns {Object} - { directUpliner, genUpliners, rootUser }
 */
export const getUplineUsers = async (userId, maxLevels = 20) => {
  let currentUser = await User.findById(userId).select('referredBy').lean();
  if (!currentUser) {
    throw new Error(`User not found for ID: ${userId}`);
  }

  let directUpliner = null;
  const genUpliners = [];
  let currentGen = 1;

  while (currentUser?.referredBy && genUpliners.length < maxLevels) {
    if (!mongoose.Types.ObjectId.isValid(currentUser.referredBy)) {
      break; // invalid referredBy id
    }

    const upliner = await User.findById(currentUser.referredBy)
      .select('_id email referredBy')
      .lean();

    if (!upliner) break;

    if (!directUpliner) {
      // First upliner becomes direct upliner
      directUpliner = {
        userId: upliner._id,
        email: upliner.email,
      };
    } else {
      // Other upliners become gen upliners
      genUpliners.push({
        userId: upliner._id,
        email: upliner.email,
        gen: currentGen,
      });
      currentGen++;
    }

    if (upliner.referredBy === null) {
      // Reached root user, stop
      break;
    }

    currentUser = upliner;
  }

  // Find root user (referredBy === null)
  const rootUser = await User.findOne({ referredBy: null })
    .select('_id email')
    .lean();

  // If no direct upliner found, assign root user as direct
  if (!directUpliner && rootUser) {
    directUpliner = {
      userId: rootUser._id,
      email: rootUser.email,
    };
  }
  // If root user is not already in direct upliner and there's still room, add to gens
  else if (
    rootUser &&
    directUpliner?.userId.toString() !== rootUser._id.toString() &&
    genUpliners.length < maxLevels
  ) {
    genUpliners.push({
      userId: rootUser._id,
      email: rootUser.email,
      gen: currentGen,
    });
  }

  return {
    directUpliner,
    genUpliners,
    rootUser: rootUser
      ? {
          userId: rootUser._id,
          email: rootUser.email,
          isCompany: true,
        }
      : null,
  };
};
