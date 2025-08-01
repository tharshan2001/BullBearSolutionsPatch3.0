import Notification from '../models/Notification.js';

// Called internally in backend to create a notification
export async function createNotification(userId, message, type = 'info') {
  if (!userId || !message) {
    throw new Error('User ID and message are required.');
  }

  const notification = new Notification({
    user: userId,
    message,
    type,
  });

  return await notification.save();
}

/**
 * GET /notifications - Get all for logged-in user
 */
export async function getNotifications(req, res) {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}




/**
 * DELETE /notifications/:id - Delete one by ID
 */
export async function removeNotification(req, res) {
  try {
    const result = await Notification.deleteOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
