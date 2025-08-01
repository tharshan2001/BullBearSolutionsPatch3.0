import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';

import connectDB from './db.js';  
import Product from '../models/Product.js';
import Announcement from '../models/Announcement.js';

async function cleanupUnusedImages() {
  try {
    await connectDB();

    const uploadDir = path.join(process.cwd(), 'uploads'); 
    const allFiles = fs.readdirSync(uploadDir);

    // Fetch used images from DB
    const products = await Product.find({}, 'image');
    const announcements = await Announcement.find({}, 'imageUrl files');

    const usedImages = new Set([
      ...products.map(p => path.basename(p.image)),
      ...announcements.flatMap(a => [
        ...(a.imageUrl ? [path.basename(a.imageUrl)] : []),
        ...a.files.map(f => path.basename(f))
      ])
    ]);

    // Delete unused files
    for (const file of allFiles) {
      if (!usedImages.has(file)) {
        fs.unlinkSync(path.join(uploadDir, file));
        console.log(`🗑️ Deleted unused file: ${file}`);
      }
    }

    console.log('✅ Cleanup completed');
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  }
}

export default cleanupUnusedImages;
