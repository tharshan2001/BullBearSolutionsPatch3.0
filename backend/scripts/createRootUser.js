import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDB from '../utils/db.js';    
import User from '../models/User.js';          

dotenv.config();

export const createRootUser = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected');

    const userCount = await User.countDocuments();

    if (userCount > 0) {
      console.log('Users already exist. Root user creation skipped.');
      process.exit(0);
    }

    const rootUserData = {
      email: 'bullbear.solution@gmail.com',
      fullName: 'BullBearSolutions',
      nic: 'ROOTNIC123456',
      phoneNumber: '+10000000000',
      password: 'RootPass123!',   
      securityPin: '1234',        
      level: 20,
      referredBy:'root'
      
    };

    const passwordHash = await bcrypt.hash(rootUserData.password, 10);
    const securityPinHash = await bcrypt.hash(rootUserData.securityPin, 10);

    const rootUser = new User({
      email: rootUserData.email,
      fullName: rootUserData.fullName,
      nic: rootUserData.nic,
      phoneNumber: rootUserData.phoneNumber,
      passwordHash,
      securityPin: securityPinHash,
      level: rootUserData.level,
    });

    await rootUser.save();

    console.log('Root user created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating root user:', error.message);
    process.exit(1);
  }
};

createRootUser();
