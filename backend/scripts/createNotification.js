import dotenv from 'dotenv';
import connectDB from '../utils/db.js';
import Notification from '../models/Notification.js';

dotenv.config();

const createNotification = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected');

    const newNotif = await Notification.create({
      user: "6859c8bdf111bf5d6d343fdc",
      type: "error",
      message: "New system update available",
      read: false,
      // createdAt and updatedAt will auto-generate if timestamps are enabled in the schema
    });

    console.log('Notification created:', newNotif);
    process.exit(0);
  } catch (error) {
    console.error('Error creating notification:', error.message);
    process.exit(1);
  }
};

createNotification();
