import mongoose from 'mongoose';
import 'dotenv/config'

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dashboard');
    console.log('✅ MongoDB connection successful');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1); 
  }
};

export default connectDB;