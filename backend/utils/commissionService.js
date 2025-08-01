import User from '../models/User.js';
import Config from '../models/Config.js';
import { getUplineUsers } from './UplineUsers.js';
import { sendCommissionNotification } from '../utils/sendCommissionNotification.js';

export const distributeLevelCommissions = async (userId, productPrice) => {
  const result = {
    success: false,
    message: '',
    totalCommission: 0,
    directCommission: 0,
    levelCommission: 0,
    totalDistributed: 0,
    unclaimedAmount: 0,
    distributionDetails: []
  };

  try {
    if (!userId || typeof productPrice !== 'number' || productPrice <= 0) {
      throw new Error('Invalid input parameters');
    }

    const config = await Config.findOne().sort({ _id: -1 }).lean();
    if (!config) {
      throw new Error('Config not found. Please create it first using your API.');
    }

    const commissionPercentage = config.commissionPercentage;
    const totalCommission = +(productPrice * commissionPercentage).toFixed(2);
    result.totalCommission = totalCommission;

    const directRate = config.directCommissionRate;
    const levelRates = config.levelRates || {};

    result.directCommission = +(totalCommission * directRate).toFixed(2);
    result.levelCommission = +(totalCommission - result.directCommission).toFixed(2);

    const uplineResult = await getUplineUsers(userId, 20);
    if (!uplineResult) throw new Error('Failed to get upline users');

    const { directUpliner, genUpliners = [], rootUser } = uplineResult;
    if (!rootUser) throw new Error('Root user not found');

    // --- Direct commission ---
    if (directUpliner) {
      const directUser = await User.findById(directUpliner.userId).select('wallet premium.active email level').lean();
      if (directUser?.premium?.active) {
        await User.findByIdAndUpdate(directUser._id, {
          $inc: { 'wallet.usdt': result.directCommission },
          $set: { 'wallet.lastUpdated': new Date() }
        });

        await sendCommissionNotification({
          userId: directUser._id,
          type: 'direct',
          amount: result.directCommission,
          sourceUserId: userId,
          message: `You earned a direct commission of $${result.directCommission.toFixed(2)}`
        });

        result.totalDistributed += result.directCommission;
        result.distributionDetails.push({
          userId: directUser._id,
          email: directUser.email,
          level: 'direct',
          amount: result.directCommission,
          status: 'paid'
        });
      } else {
        result.unclaimedAmount += result.directCommission;
        result.distributionDetails.push({
          userId: directUpliner.userId,
          email: directUser?.email || 'unknown',
          level: 'direct',
          amount: result.directCommission,
          status: 'unclaimed'
        });
      }
    } else {
      result.unclaimedAmount += result.directCommission;
    }

    // --- Level commissions ---
    let levelDistributed = 0;

    const activeLevels = Object.entries(levelRates)
      .filter(([_, rate]) => rate > 0)
      .map(([levelStr, rate]) => ({ level: parseInt(levelStr, 10), rate }));

    const totalLevelRate = activeLevels.reduce((sum, l) => sum + l.rate, 0);

    if (genUpliners.length > 0 && totalLevelRate > 0) {
      let distributed = 0;

      for (let i = 0; i < activeLevels.length; i++) {
        const { level, rate } = activeLevels[i];

        // Commission amount for this level
        let amount;
        if (i === activeLevels.length - 1) {
          amount = +(result.levelCommission - distributed).toFixed(2);
        } else {
          amount = +(result.levelCommission * (rate / totalLevelRate)).toFixed(2);
          distributed += amount;
        }

        // Find user with exact gen match
        const upliner = genUpliners.find(u => u.gen === level);

        if (!upliner) {
          result.unclaimedAmount += amount;
          result.distributionDetails.push({
            userId: null,
            email: null,
            level: `gen_${level}`,
            amount,
            status: 'unclaimed_no_user'
          });
          continue;
        }

        const uplineUser = await User.findById(upliner.userId).select('wallet premium.active email level').lean();

        if (uplineUser?.premium?.active && uplineUser.level >= level) {
          await User.findByIdAndUpdate(uplineUser._id, {
            $inc: { 'wallet.usdt': amount },
            $set: { 'wallet.lastUpdated': new Date() }
          });

          await sendCommissionNotification({
            userId: uplineUser._id,
            type: 'level',
            amount,
            level: `gen_${level}`,
            sourceUserId: userId,
            message: `You earned a level ${level} commission of $${amount.toFixed(2)}`
          });

          levelDistributed += amount;
          result.distributionDetails.push({
            userId: uplineUser._id,
            email: uplineUser.email,
            level: `gen_${level}`,
            amount,
            status: 'paid'
          });
        } else {
          result.unclaimedAmount += amount;
          result.distributionDetails.push({
            userId: uplineUser?._id || upliner.userId,
            email: uplineUser?.email || null,
            level: `gen_${level}`,
            amount,
            status: 'unclaimed'
          });
        }
      }
    } else {
      result.unclaimedAmount += result.levelCommission;
      result.distributionDetails.push({
        userId: null,
        email: null,
        level: 'level_commission',
        amount: result.levelCommission,
        status: 'unclaimed_no_upliners'
      });
    }

    result.totalDistributed += levelDistributed;

    // --- Unclaimed to root ---
    if (result.unclaimedAmount > 0) {
      await User.findByIdAndUpdate(rootUser.userId, {
        $inc: { 'wallet.usdt': result.unclaimedAmount },
        $set: { 'wallet.lastUpdated': new Date() }
      });

      await sendCommissionNotification({
        userId: rootUser.userId,
        type: 'root',
        amount: result.unclaimedAmount,
        status: 'unclaimed_processed',
        sourceUserId: userId,
        message: `You received $${result.unclaimedAmount.toFixed(2)} from unclaimed commissions`
      });

      result.distributionDetails.push({
        userId: rootUser.userId,
        email: rootUser.email,
        level: 'root',
        amount: result.unclaimedAmount,
        status: 'unclaimed_processed'
      });
    }

    // Final validation
    const tolerance = 0.01;
    const expectedTotal = result.directCommission + result.levelCommission;
    const actualTotal = result.totalDistributed + result.unclaimedAmount;
    if (Math.abs(actualTotal - expectedTotal) > tolerance) {
      throw new Error(`Commission distribution mismatch. Expected: $${expectedTotal.toFixed(2)}, Actual: $${actualTotal.toFixed(2)}`);
    }

    result.success = true;
    result.message = 'Commission distribution completed successfully';
    return result;

  } catch (error) {
    console.error('❌ Commission distribution failed:', error);
    result.message = error.message;
    return result;
  }
};
