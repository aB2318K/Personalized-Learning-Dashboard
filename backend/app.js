const express = require('express');
import connectDB from './config/db';
const jwt = require('jsonwebtoken');
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes.js';
import passwordRoutes from './routes/passwordRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
const app = express();
const CORS = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('./models/User');
const Task = require('./models/Task');
const Goal = require('./models/Goal');
const History = require('./models/History');
const Saved = require('./models/Saved');
const Post = require('./models/Post');
const PostAnswer = require('./models/PostAnswer');
const Notification = require('./models/Notification');
const Feedback = require('./models/Feedback');
const vader = require('vader-sentiment');
const { HfInference } = require('@huggingface/inference');


app.use(CORS());
app.use(express.json());
require('dotenv').config();

connectDB();

app.use(authRoutes);
app.use(userRoutes);
app.use(passwordRoutes);
app.use(taskRoutes);
app.use(goalRoutes);
app.use(mediaRoutes);
app.use(forumRoutes);
  
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});