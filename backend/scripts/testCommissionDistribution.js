import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../utils/db.js';
import { distributeLevelCommissions } from '../utils/commissionService.js';

const runTest = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Sample user ID (must exist in DB)
    const sampleUserId = '6879e2e9b5cebacbadb3755c'; // Replace with a valid user ID
    const productPrice = 100;

    console.log('\n🚀 Running Commission Distribution Test...');
    console.log(`➡️ User ID: ${sampleUserId}`);
    console.log(`➡️ Product Price: $${productPrice}`);

    const result = await distributeLevelCommissions(sampleUserId, productPrice);

    console.log('\n=== 💸 Commission Distribution Result ===');
    console.log(`✅ Success: ${result.success}`);
    console.log(`📢 Message: ${result.message}`);
    console.log(`💰 Total Commission: $${result.totalCommission.toFixed(2)}`);
    console.log(`➡️ Direct Commission: $${result.directCommission.toFixed(2)}`);
    console.log(`➡️ Level Commission: $${result.levelCommission.toFixed(2)}`);
    console.log(`✅ Total Distributed: $${result.totalDistributed.toFixed(2)}`);
    console.log(`❗ Unclaimed Amount: $${result.unclaimedAmount.toFixed(2)}`);

    console.log('\n🔍 Distribution Breakdown:');
    result.distributionDetails.forEach((detail, index) => {
      console.log(`  ${index + 1}. [${detail.status.toUpperCase()}]`);
      console.log(`     • User ID: ${detail.userId}`);
      console.log(`     • Email: ${detail.email}`);
      console.log(`     • Level: ${detail.level}`);
      console.log(`     • Amount: $${detail.amount.toFixed(2)}`);
    });

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

runTest();
