import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../utils/db.js';
import User from '../models/User.js';
import { addUserSales } from '../utils/addUserSales.js';

dotenv.config(); // To load MONGO_URI

async function runTest() {
  try {
    await connectDB();
    console.log('✅ Connected to DB');

    // 👉 Replace this with your real user ID
    const userId = '686390b26a2a56de5e020a53'; 
    const saleAmount = 500; // 👉 Replace with your desired amount

    console.log(`💰 Adding sales of ${saleAmount} to user ${userId}`);

    await addUserSales(userId, saleAmount);
    console.log('✅ Sales distributed');

    // Fetch updated user and upliner chain
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new Error('User not found');
    }

    console.log('\n=== User Sales After Update ===');
    console.log(`User (${user.fullName}) => personalSales: ${user.sales.personalSales}, directSponsorSales: ${user.sales.directSponsorSales}, groupSales: ${user.sales.groupSales}`);

    // Find upliners
    let uplinerId = user.referredBy;
    let level = 0;
    while (uplinerId) {
      const upliner = await User.findById(uplinerId).lean();
      if (!upliner) break;

      console.log(`Upliner Gen ${level} (${upliner.fullName}) => personalSales: ${upliner.sales.personalSales}, directSponsorSales: ${upliner.sales.directSponsorSales}, groupSales: ${upliner.sales.groupSales}`);

      uplinerId = upliner.referredBy;
      level++;
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from DB');
  }
}

runTest();
