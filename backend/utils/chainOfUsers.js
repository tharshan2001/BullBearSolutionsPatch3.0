import mongoose from 'mongoose';
import User from '../models/User.js';

/** for assign the sales 
 * Get the upliner chain, with direct sponsor as gen 0, next upliners as 1, 2, ...
 * Traverses upliners until root (no referredBy).
 * @param {String} userId - The starting user ID
 * @returns {Promise<Array>} - Array of upliners with their generation (gen) and userId
 */
export const getUplinerChain = async (userId) => {
  const uplinerChain = [];
  
  let currentGen = 0; // Direct sponsor is gen 0
  let currentUserId = userId;

  while (true) {
    try {
      if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
        break;
      }

      const user = await User.findById(currentUserId).select('referredBy').lean();
      if (!user || !user.referredBy) {
        break;
      }

      if (!mongoose.Types.ObjectId.isValid(user.referredBy)) {
        break;
      }

      const upliner = await User.findById(user.referredBy).select('_id').lean();
      if (!upliner) {
        break;
      }

      uplinerChain.push({
        userId: upliner._id,
        gen: currentGen,
      });

      currentUserId = upliner._id;
      currentGen++;
    } catch (error) {
      console.error(`Error at gen ${currentGen}:`, error);
      break;
    }
  }

  return uplinerChain;
};
