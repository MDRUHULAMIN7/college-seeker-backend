import app from '../src/app.js';
import config from '../src/app/config/index.js';
import mongoose from 'mongoose';

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return;
  }
  
  try {
    await mongoose.connect(config.database_url as string);
    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default async function handler(req: any, res: any) {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}