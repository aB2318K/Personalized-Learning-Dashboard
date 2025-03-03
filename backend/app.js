import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Configurations
import connectDB from './config/db.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import passwordRoutes from './routes/passwordRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import youtubeRoutes from './routes/youtubeRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';

// Initialize app
const app = express();

// Configure environment variables first
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
connectDB();

// Route mounting
app.use(authRoutes);
app.use(userRoutes);
app.use(passwordRoutes);
app.use(taskRoutes);
app.use(goalRoutes);
app.use(mediaRoutes);
app.use(forumRoutes);
app.use(youtubeRoutes);
app.use(feedbackRoutes);

// Server startup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});