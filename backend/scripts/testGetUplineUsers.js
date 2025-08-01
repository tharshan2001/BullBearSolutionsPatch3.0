import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../utils/db.js'; 
import { getUplineUsers } from '../utils/UplineUsers.js';

dotenv.config();

const TEST_USER_ID = '686390b26a2a56de5e020a53'; 

const testGetUplineUsers = async () => {
  try {
    await connectDB();

    console.log(`Testing getUplineUsers for User ID: ${TEST_USER_ID}`);
    const result = await getUplineUsers(TEST_USER_ID);

    console.log('\n=== Result ===');
    console.log('Direct Upliner:', result.directUpliner || 'None found');
    console.log('Gen Upliners:', result.genUpliners && result.genUpliners.length ? result.genUpliners : 'None found');
    console.log('Root User:', result.rootUser || 'None found');
  } catch (error) {
    console.error('Error testing getUplineUsers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    process.exit(0);
  }
};

testGetUplineUsers();
