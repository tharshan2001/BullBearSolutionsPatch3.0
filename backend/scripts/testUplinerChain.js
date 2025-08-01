import dotenv from 'dotenv';
import connectDB from '../utils/db.js';      
import mongoose from 'mongoose';
import { getUplinerChain } from '../utils/chainOfUsers.js';

dotenv.config();

const TEST_USER_ID = '686390e96a2a56de5e020a59'; // Replace with actual user ID

const testUplinerChain = async () => {
  try {
    await connectDB();

    // No maxGen argument now
    const chain = await getUplinerChain(TEST_USER_ID);

    console.log(`\n=== Upliner Chain for User ID: ${TEST_USER_ID} ===`);
    if (chain.length === 0) {
      console.log('⚠️ No upliners found (root user or no sponsors)');
    } else {
      chain.forEach(({ userId, gen }) => {
        console.log(`Gen ${gen}: User ID [${userId}]`);
      });
    }
  } catch (error) {
    console.error('❌ Error testing upliner chain:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
    process.exit(0);
  }
};

testUplinerChain();
