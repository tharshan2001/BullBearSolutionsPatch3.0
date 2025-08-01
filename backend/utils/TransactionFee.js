 import User from '../models/User.js'

/**
 * Deducts a 5% fee from a transaction amount and updates the user's wallet.
 * @param {string} userId - The user's MongoDB ObjectId as a string.
 * @param {number} transactionAmount - The original transaction amount.
 * @returns {Promise<{ netAmount: number, fee: number, updatedBalance: number }>}
 */
export async function deductTransactionFeeAndUpdateWallet(userId, transactionAmount) {
  if (typeof transactionAmount !== 'number' || transactionAmount <= 0) {
    throw new Error('Transaction amount must be a positive number');
  }

  // Calculate fee and net amount
  const fee = transactionAmount * 0.05;
  const netAmount = transactionAmount - fee;

  // Get user by ID
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Check if user has enough balance (optional, depending on your logic)
  if (user.wallet.usdt < transactionAmount) {
    throw new Error('Insufficient wallet balance');
  }

  // Deduct the original transaction amount from user's wallet
  user.wallet.usdt -= transactionAmount;

  // Optionally: If you want to credit the net amount somewhere else, you can do it here

  // Save updated user
  await user.save();

  return {
    netAmount,
    fee,
    updatedBalance: user.wallet.usdt,
  };
}
