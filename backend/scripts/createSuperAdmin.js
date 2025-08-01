import dotenv from 'dotenv';
import connectDB from '../utils/db.js';
import Admin from '../models/Admin.js';

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await connectDB(); 
    console.log('MongoDB connected');

    const existingSuperAdmin = await Admin.findOne({ role: 'superadmin' });
    if (existingSuperAdmin) {
      console.log('Super Admin already exists.');
      process.exit(0);
    }

    const superAdmin = await Admin.create({
      username: 'xxxx',
      password: 'admin123',  
      email: 'Tharshan@gmail.com',
      role: 'superadmin',
    });

    console.log('Super Admin created:', superAdmin);
    process.exit(0);
  } catch (error) {
    console.error('Error creating Super Admin:', error.message);
    process.exit(1);
  }
};

createSuperAdmin();
