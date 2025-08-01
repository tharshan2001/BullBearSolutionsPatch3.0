import CommissionNotification from '../models/CommissionNotification.js';

/**
 * @desc Get commission notifications for the authenticated user
 * @route GET /api/commission-notifications
 */
export const getCommissionNotificationsByUser = async (req, res) => {
  try {
    const userId = req.user._id; // Get userId from authenticated user (protect middleware must set this)
    const { limit = 20, page = 1 } = req.query;

    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);

    const notifications = await CommissionNotification.find({ userId })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const total = await CommissionNotification.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc Create a commission notification (admin or system use)
 * @route POST /api/commission-notifications
 */
export const createCommissionNotification = async (req, res) => {
  try {
    const {
      userId,
      type,
      amount,
      sourceUserId,
      level,
      status = 'paid',
      message = ''
    } = req.body;

    if (!userId || !type || typeof amount !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, type, or amount'
      });
    }

    const notification = new CommissionNotification({
      userId,
      type,
      amount,
      sourceUserId,
      level,
      status,
      message
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message: 'Commission notification created successfully',
      data: notification
    });
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc Delete a notification (admin only)
 * @route DELETE /api/commission-notifications/:id
 */
export const deleteCommissionNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await CommissionNotification.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
