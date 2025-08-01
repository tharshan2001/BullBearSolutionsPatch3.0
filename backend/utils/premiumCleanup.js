import User from '../models/User.js';

export async function deactivateExpiredPremiums() {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  try {
    const result = await User.updateMany(
      {
        'premium.active': true,
        'premium.activatedDate': { $lte: oneYearAgo },
      },
      {
        $set: { 'premium.active': false },
      }
    );

    console.log(`Premium cleanup: ${result.modifiedCount} users deactivated.`);
  } catch (error) {
    console.error('Error running premium cleanup:', error);
  }
}
