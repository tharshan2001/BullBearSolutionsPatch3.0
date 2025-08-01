import CommissionNotification from '../models/CommissionNotification.js';

export const sendCommissionNotification = async ({
  userId,
  type,
  amount,
  level = null,
  sourceUserId = null,
  status = 'paid',
  message = ''
}) => {
  try {
    if (!userId || !type || typeof amount !== 'number') return;

    await new CommissionNotification({
      userId,
      type,
      amount,
      level,
      sourceUserId,
      status,
      message
    }).save();
  } catch (err) {
    console.error('❌ Failed to send commission notification:', err.message);
  }
};
