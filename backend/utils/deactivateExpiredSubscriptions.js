import Subscription from '../models/Subscription.js';

export async function deactivateExpiredSubscriptions() {
  const now = new Date();

  try {
    const result = await Subscription.updateMany(
      {
        status: 'active',
        expiresAt: { $lte: now },
      },
      {
        $set: { status: 'expired' },
      }
    );

    console.log(`Subscription cleanup: ${result.modifiedCount} subscriptions deactivated.`);
  } catch (error) {
    console.error('Error running subscription cleanup:', error);
  }
}
