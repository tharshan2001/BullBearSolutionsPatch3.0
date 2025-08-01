import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './utils/db.js';
import cookieParser from 'cookie-parser';
import cron from 'node-cron';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { EventEmitter } from 'events'; 

//for auto cleanup
import { deactivateExpiredPremiums } from './utils/premiumCleanup.js';
import { deactivateExpiredSubscriptions } from './utils/deactivateExpiredSubscriptions.js';
import cleanupUnusedImages from './utils/cleanupUnusedImages.js';


//routes
import authRoutes from './routes/authRoutes.js';
import tempRoutes from './routes/tempRoutes.js'; 
import referralRoutes from './routes/referralRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import productRoutes from './routes/productRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import configRoutes from './routes/configRoutes.js'
import transactionRoutes from './routes/transactionRoutes.js';
import premiumPlanRoutes from './routes/premiumPlanRoutes.js';
import networkRoutes from './routes/networkAddressesRoutes.js';
import commissionNotificationRoutes from './routes/commissionNotificationRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import helpCenterRoutes from './routes/helpCenterRoutes.js'



// __________ADD THIS AT THE TOP ___________
process.on('warning', (warning) => {
  console.warn('⚠️ Warning:', warning.name);
  console.warn(warning.message);
  console.warn(warning.stack);
});




// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();



const app = express();

// Needed to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve uploads folder statically at /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL_admin,
  process.env.FRONTEND_URL_user
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));


app.use(express.json({
  strict: true,
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch {
      throw new Error('Bad JSON');
    }
  }
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/temp', tempRoutes); 
app.use('/api/referrals', referralRoutes);
app.use('/api/products', productRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/subscriptions', subscriptionRoutes); 
app.use('/api/transactions', transactionRoutes);
app.use('/api/commission-notifications', commissionNotificationRoutes);
app.use('/api/addresses', networkRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/help-center', helpCenterRoutes);


//admin routes
app.use('/api/premium', premiumPlanRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/config/',configRoutes ); 
app.use('/api/admin', adminRoutes);








// JSON error handler
app.use((err, req, res, next) => {
  if (err.message === 'Bad JSON') {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  console.error(err.stack); // Log full error in server
  res.status(500).json({ error: 'Internal Server Error' });
});

// Cron job to deactivate expired premium accounts and subscriptions
if (process.env.NODE_ENV === 'production') {
  cron.schedule('0 0 * * *', async () => {
    console.log('⏳ Running daily cleanup jobs...');

    try {
      await deactivateExpiredPremiums();
      await deactivateExpiredSubscriptions();
      await cleanupUnusedImages();

      console.log('Premium, subscription, and image cleanup jobs completed.');
    } catch (error) {
      console.error('Error during daily cleanup jobs:', error);
    }
  });
}

// 🧩 SOCKET.IO Integration

const server = http.createServer(app);

const io = new SocketIO(server, {
  cors: {
    origin: ['http://localhost:8000', 'http://localhost:6001'],
    credentials: true
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5030;
const DOMAIN = process.env.DOMAIN || 'http://localhost';

server.listen(PORT, () => {
  console.log(`🚀 Server running on ${DOMAIN}:${PORT}`);
});


