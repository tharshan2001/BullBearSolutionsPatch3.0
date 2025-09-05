import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import Product from '../models/Product.js';
import { distributeLevelCommissions } from '../utils/commissionService.js';
import { createNotification } from './notificationController.js';
import { addUserSales } from '../utils/addUserSales.js';

// Subscribe to a product
export const subscribeToProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, walletMethod, securityPin } = req.body;

    if (!walletMethod || !['usdt', 'cw'].includes(walletMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing wallet method.' });
    }

    const product = await Product.findById(productId);
    if (!product || product.isHidden || !product.isAvailable) {
      return res.status(404).json({ success: false, message: 'Product not found or unavailable.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let discount = product.discount || 0;
    let finalPrice = product.Price * (1 - discount / 100);
    if (finalPrice < 0) finalPrice = 0;

    // 1. Check for expired subscription to reactivate
    const now = new Date();
    const expiredSub = await Subscription.findOne({
      user: userId,
      product: productId,
      status: 'expired'
    });

    if (expiredSub) {
      // Check wallet balance before reactivation
      if (!user.wallet || user.wallet[walletMethod] < finalPrice) {
        return res.status(400).json({ success: false, message: `Insufficient ${walletMethod.toUpperCase()} balance.` });
      }

      // Deduct wallet amount
      await User.findByIdAndUpdate(userId, {
        $inc: { [`wallet.${walletMethod}`]: -finalPrice },
        $set: { 'wallet.lastUpdated': new Date() }
      });

      await addUserSales(userId, finalPrice);

      const commissionResult = await distributeLevelCommissions(userId, finalPrice);
      if (!commissionResult.success) {
        return res.status(500).json({ success: false, message: 'Commission distribution failed: ' + commissionResult.message });
      }

      // Reactivate subscription: update status, dates
      expiredSub.status = 'pending'; // or 'active' if you want immediate activation
      expiredSub.subscribedAt = now;
      expiredSub.expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Example: add 30 days
      await expiredSub.save();

      await createNotification(userId, `Your subscription to ${product.Title} has been reactivated.`, 'subscribe');

      return res.status(200).json({
        success: true,
        message: 'Subscription reactivated successfully',
        subscription: expiredSub,
        commissionDistribution: commissionResult
      });
    }

    // 2. Block if active or pending subscription already exists
    const existing = await Subscription.findOne({
      user: userId,
      product: productId,
      status: { $in: ['pending', 'active'] }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active or pending subscription for this product.',
        subscriptionId: existing._id
      });
    }

    // 3. Check wallet balance before creating new subscription
    if (!user.wallet || user.wallet[walletMethod] < finalPrice) {
      return res.status(400).json({ success: false, message: `Insufficient ${walletMethod.toUpperCase()} balance.` });
    }

    // Deduct wallet amount
    await User.findByIdAndUpdate(userId, {
      $inc: { [`wallet.${walletMethod}`]: -finalPrice },
      $set: { 'wallet.lastUpdated': new Date() }
    });

    await addUserSales(userId, finalPrice);

    const commissionResult = await distributeLevelCommissions(userId, finalPrice);
    if (!commissionResult.success) {
      return res.status(500).json({ success: false, message: 'Commission distribution failed: ' + commissionResult.message });
    }

    // Create new subscription
    const subscription = new Subscription({
      user: userId,
      product: productId,
      status: 'pending',
      subscribedAt: now,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // Example: 30 days
    });

    await subscription.save();

    await createNotification(userId, `You successfully subscribed to ${product.Title}.`, 'subscribe');

    return res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      subscription,
      commissionDistribution: commissionResult
    });

  } catch (error) {
    console.error('Subscribe to product error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


// Get subscriptions
export const getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.user._id;
    const subscriptions = await Subscription.find({ user: userId })
      .populate({
        path: 'product',
        select: 'Title Price isAvailable isHidden'
      })
      .lean();

    const filtered = subscriptions.filter(sub => 
      sub.product && sub.product.isAvailable && !sub.product.isHidden
    );

    return res.status(200).json({ success: true, subscriptions: filtered });
  } catch (error) {
    console.error('Get user subscriptions error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


// Renew
export const renewSubscription = async (req, res) => {
  try {
    const userId = req.user._id;
    const { subscriptionId } = req.params;
    const { walletMethod } = req.body;

    if (!walletMethod || !['usdt', 'cw'].includes(walletMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing wallet method.' });
    }

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription || subscription.user.toString() !== userId.toString()) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Only active subscriptions can be renewed' });
    }

    const product = await Product.findById(subscription.product);
    if (!product || product.isHidden || !product.isAvailable) {
      return res.status(404).json({ success: false, message: 'Product not found or unavailable' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let discount = product.discount || 0;
    let finalPrice = product.Price * (1 - discount / 100);
    if (finalPrice < 0) finalPrice = 0;

    if (!user.wallet || user.wallet[walletMethod] < finalPrice) {
      return res.status(400).json({ success: false, message: `Insufficient ${walletMethod.toUpperCase()} balance.` });
    }

    await User.findByIdAndUpdate(userId, {
      $inc: { [`wallet.${walletMethod}`]: -finalPrice },
      $set: { 'wallet.lastUpdated': new Date() }
    });

    await addUserSales(userId, finalPrice);

    const commissionResult = await distributeLevelCommissions(userId, finalPrice);
    if (!commissionResult.success) {
      return res.status(500).json({ success: false, message: 'Commission distribution failed: ' + commissionResult.message });
    }

    const currentExpiry = subscription.expiresAt > new Date() ? subscription.expiresAt : new Date();
    const newExpiry = new Date(currentExpiry);
    newExpiry.setFullYear(newExpiry.getFullYear() + 1);

    subscription.expiresAt = newExpiry;
    await subscription.save();

    await createNotification(userId, `Your subscription to ${product.Title} has been renewed.`, 'subscribe');

    return res.status(200).json({
      success: true,
      message: 'Subscription renewed successfully',
      subscription,
      commissionDistribution: commissionResult
    });

  } catch (error) {
    console.error('Renew subscription error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Expire
export const expireSubscription = async (req, res) => {
  try {
    const userId = req.user._id;
    const { subscriptionId } = req.params;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription || subscription.user.toString() !== userId.toString()) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    subscription.status = 'expired';
    await subscription.save();

    await createNotification(userId, `Your subscription to ${subscription.product} has been marked as expired.`, 'warning');

    return res.status(200).json({ success: true, message: 'Subscription expired successfully', subscription });

  } catch (error) {
    console.error('Expire subscription error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Check subscription
export const checkUserSubscription = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const subscription = await Subscription.findOne({
      user: userId,
      product: productId,
      status: 'active',
      expiresAt: { $gt: new Date() }
    });

    return res.status(200).json({ success: true, subscribed: !!subscription });

  } catch (error) {
    console.error('Check subscription error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


export const getSubscriptionsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Populate product only if available & visible
    const subscriptions = await Subscription.find({ user: userId })
      .populate({
        path: 'product',
        match: { isAvailable: true, isHidden: false }, // filter here
        select: 'Title Price isAvailable isHidden image'
      })
      .lean();

    // Only return subscriptions where product exists
    const filtered = subscriptions.filter(sub => sub.product);

    return res.status(200).json({ success: true, subscriptions: filtered });
  } catch (error) {
    console.error('Get subscriptions by userId error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


// Activate by admin
export const updateSubscriptionToActive = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await Subscription.findById(subscriptionId).populate('product user');
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    const now = new Date();
    const expiry = new Date(now);
    expiry.setFullYear(expiry.getFullYear() + 1);

    subscription.status = 'active';
    subscription.subscribedAt = now;
    subscription.expiresAt = expiry;

    await subscription.save();

    await createNotification(subscription.user._id, `Your subscription to ${subscription.product.Title} has been activated.`, 'subscribe');

    return res.status(200).json({
      success: true,
      message: 'Subscription activated successfully',
      subscription: {
        status: subscription.status,
        user: {
          _id: subscription.user._id,
          email: subscription.user.email,
        }
      }
    });

  } catch (error) {
    console.error('Update subscription to active error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Deactivate by admin
export const deactivateSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await Subscription.findById(subscriptionId).populate('product user');
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    if (subscription.status === 'expired') {
      return res.status(400).json({ success: false, message: 'Subscription is already expired' });
    }

    subscription.status = 'expired';
    await subscription.save();

    await createNotification(subscription.user._id, `Your subscription to ${subscription.product.Title} has been deactivated.`, 'warning');

    return res.status(200).json({
      success: true,
      message: 'Subscription deactivated successfully',
      subscription: {
        status: subscription.status,
        user: {
          _id: subscription.user._id,
          email: subscription.user.email,
        }
      }
    });

  } catch (error) {
    console.error('Deactivate subscription error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


// Get all subscriptions (admin only)
export const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate({
        path: 'product',
        select: 'Title Price isAvailable isHidden'
      })
      .populate('user', 'email username')
      .lean();

    // Filter only subscriptions with available & visible products
    const filtered = subscriptions.filter(sub => 
      sub.product && sub.product.isAvailable && !sub.product.isHidden
    );

    return res.status(200).json({ success: true, subscriptions: filtered });
  } catch (error) {
    console.error('Get all subscriptions error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

