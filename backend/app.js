const express = require('express');
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
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

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dashboard'; 
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.log('Error connecting to MongoDB:', error));

// Function to format date as DD/MM/YYYY
const formatToUKDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

//hash password 
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}


//compare the has password with the password during login phase
async function comparePasswords(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}


//generate token for a period of 2 hour
function generateToken(user) {
    return jwt.sign({id: user.id}, process.env.JWT_SECRET_KEY, {
        expiresIn: '2h', //set token expiration time
    });
}

function generateSecretToken(user) {
    return jwt.sign(
        { id: user.id },
        process.env.JWT_RESET_SECRET_KEY, 
        { expiresIn: '2h' }  
    );
}

//login auhentication flow
async function loginUser(req, res) {
    const { email, password } = req.body;
    try {
        const currentUser = await User.findOne({ email });
        if (!currentUser) {
            return res.status(404).json({ message: 'User cannot be not found' });
        }

        const checkIfPasswordValid = await comparePasswords(password, currentUser.password);
        if (!checkIfPasswordValid) {
            return res.status(401).json({ message: 'Access denied, passwords do not match' });
        }

        const token = generateToken(currentUser);
        res.status(200).json({ message: 'Login was successful', token, userID: currentUser._id });
    } catch (error) {
        console.log(error.message)
        res.status(400).json({ message: 'Error during login', error: error.message });
    }

}

//sign up authentication flow
async function signUpUser(req, res) {
    const { firstname, lastname, email, password } = req.body;
    try {
        // Check if the user with this email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: '*This email is already registered. Try logging in instead.' });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Create new user instance
        const newUser = new User({
            firstname,
            lastname,
            email,
            password: hashedPassword
        });

        // Save new user to the database
        const savedUser = await newUser.save();
        res.status(201).json({ message: 'Registration was successful', user: savedUser });
    } catch (error) {
        console.error('Error during sign up:', error.message);
        res.status(500).json({ message: 'An error occurred during sign up.', error: error.message });
    }
}

//middle for JWT authentication
function authenticateToken(req, res, next) { 
    const token = req.header('Authorization')?.split(' ')[1];

    if(!token) {
        return res.status(401).json({ message: 'Access denied, no token given'});
    }

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decode;
        next();
    }
    catch(error) {
        res.status(400).json({message: 'Invalid token'})
    }
}

app.get('/authenticate', authenticateToken, (req, res) => {
    res.json({ message: 'You have been granted protected access', user: req.user});
})

app.post('/signup', signUpUser);

app.post('/login', loginUser);

//Get logged in User information
app.get('/user', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.query; 

        // Check if both userId is a valid MongoDB Object IDs
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID.' });
        }

        // Convert userId and speechId to MongoDB ObjectId
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Find the speech by speechId
        const user = await User.findById(userObjectId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Return the speech if userId matches
        return res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ message: 'Server error.', error: error.message });
    }
})

//Edit user information
app.put('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { infoName } = req.query;
        const { info } = req.body;

        // Validate the user ID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID.' });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Find the user by ID
        const user = await User.findById(userObjectId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        // Update the field based on `infoName`
        if (infoName === 'firstname') {
            user.firstname = info;
        } else if (infoName === 'lastname') {
            user.lastname = info;
        } else {
            return res.status(400).json({ message: 'Invalid info name.' });
        }

        // Save the updated user
        const updatedUser = await user.save();
        res.status(200).json(updatedUser);

    } catch (error) {
        console.error('Error updating User Information:', error);
        return res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

//Change user password from profile page
app.put('/user/:userId/password', authenticateToken, async (req, res) => {
    console.log(req.body)
    try {
        const { userId } = req.params;
        const { currentPassword, newPassword } = req.body;

        // Validate the user ID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if current password is correct
        const isPasswordValid = await comparePasswords(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: '*Invalid password.' });
        }

        // Check if new password is different from the current password
        const isSamePassword = await comparePasswords(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ sameMessage: '*New password must be different from the current password.' });
        }

        // Hash the new password and update
        const hashedPassword = await hashPassword(newPassword);
        user.password = hashedPassword;

        // Save the updated user
        await user.save();

        res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

//Delete user by user ID
app.delete('/user', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.body;

        // Check if userId is valid
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID.' });
        }

        // Find the user to delete
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Delete the user's posts
        await Post.deleteMany({ user: userId });

        // Find all answers by the user
        const userAnswers = await PostAnswer.find({ user: userId });

        // Decrement the answersCount for associated posts
        const postIds = userAnswers.map(answer => answer.post); // Extract post IDs
        await Promise.all(postIds.map(async postId => {
            await Post.findByIdAndUpdate(postId, { $inc: { answersCount: -1 } });
        }));

        // Delete the user's answers and votes on answers
        await PostAnswer.deleteMany({ user: userId });
        await PostAnswer.updateMany(
            { 'votes.userId': userId },
            { $pull: { votes: { userId: userId } } }
        );

        // Delete other related data (Task, Goal, History, Saved, Notifcation, Feedback)
        await Task.deleteMany({ user: userId });
        await Goal.deleteMany({ user: userId });
        await History.deleteMany({ userId });
        await Saved.deleteMany({ userId });
        await Notification.deleteMany({ triggeredBy: userId });
        await Feedback.deleteMany({ userId });
        // Finally, delete the user
        await User.deleteOne({ _id: userId });

        res.status(200).json({ message: 'User and related data deleted successfully.' });

    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

//Sending password reset link to email
app.post('/reset', async (req, res) => {
    const { email } = req.body;
    try {
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Generate reset token and resetId
        const resetToken = generateSecretToken(existingUser);
        existingUser.resetToken = resetToken;

        try {
            const resetId = crypto.randomBytes(16).toString('hex');
            existingUser.resetId = resetId;
            await existingUser.save();
        } catch (error) {
            if (error.code === 11000 && error.keyPattern?.resetId) {
                // Retry logic for duplicate resetId
                existingUser.resetId = crypto.randomBytes(16).toString('hex');
                await existingUser.save();
            } else {
                throw error; // Rethrow other errors
            }
        }

        // Send the reset email
        const mailer = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });

        const resetLink = `https://personalized-learning-dashboard-1.onrender.com/${existingUser.resetId}`;
        const options = {
            to: existingUser.email,
            from: 'no-reply@gmail.com',
            subject: 'Password Reset',
            text: `Click the link below to reset your password:\n\n${resetLink}\n\nThis link will expire in 2 hours.`,
        };

        await mailer.sendMail(options);
        return res.status(200).json({ message: 'Password reset email sent.' });
    } catch (error) {
        console.error('Error during password reset request:', error.message);
        return res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

//Retrieving reset token
app.get('/reset-password', async(req, res) => {
    const { resetId } = req.query;
    try {
        const existingUser = await User.findOne({ resetId });

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json(existingUser.resetToken);

    } catch (error) {
        return res.status(500).json({ message: 'Server error.', error: error.message })
    }
})

//Resetting password
app.post('/reset-password', async (req, res) => {
    const { newPassword, resetToken } = req.body;
    try {
        // Verify the reset token
        const decoded = jwt.verify(resetToken, process.env.JWT_RESET_SECRET_KEY);
        
        // Check if the token has expired
        if (Date.now() >= decoded.exp * 1000) {
            return res.status(400).json({ message: 'Reset token has expired.' });
        }

        const userId = decoded.id;

        // Find the user associated with the reset token
        const existingUser = await User.findOne({ _id: userId, resetToken });

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the new password is the same as the current one
        const isSamePassword = await comparePasswords(newPassword, existingUser.password);
        if (isSamePassword) {
            return res.status(400).json({ sameMessage: '*New password must be different from the current password.' });
        }

        // Hash the new password and update it
        existingUser.password = await hashPassword(newPassword);
        existingUser.resetToken = undefined;
        existingUser.resetId = undefined;

        await existingUser.save();
        return res.status(200).json({ message: 'Password successfully reset.' });
    } catch (error) {
        console.error('Error resetting password:', error.message);
        return res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

//Getting results from youtube search
app.get('/search', async (req, res) => {
    const { q } = req.query; // Extract the 'q' query parameter

    // Validate the query parameter
    if (!q) {
        return res.status(400).json({ error: "Please provide a search query in the 'q' parameter." });
    }

    try {
        // Build the YouTube API URL
        const apiUrl = `${process.env.BASE_URL}?part=snippet&q=${encodeURIComponent(q)}&type=video&maxResults=10&key=${process.env.API_KEY}`;

        // Fetch data using node-fetch
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.statusText}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching YouTube data:', error.message);
        res.status(500).json({ error: "Failed to fetch data from YouTube API. Please try again later." });
    }
});

//Adding Task
app.post('/tasks', authenticateToken, async (req, res) => {
    try {
      const { name, dueDate, userId } = req.body;
      if (!name || !dueDate || !userId) {
        return res.status(400).json({ message: 'Task name, due date, and user ID are required.' });
      } 
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }  
      // Create a new task
      const newTask = new Task({
        name,
        dueDate,
        user: user._id,
      }); 
      // Save the task to the database
      await newTask.save();
      // Add formattedDueDate to the response
      res.status(201).json({
        message: 'Task created successfully.',
        task: {
          ...newTask._doc, // Spread the original task fields
          formattedDueDate: formatToUKDate(newTask.dueDate),
        },
      }); 
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error. Could not create task.' });
    }
});

// Get tasks based on completed status
app.get('/tasks', authenticateToken, async (req, res) => {
    try {
        const { userId, completed } = req.query; 

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        } 

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const filter = { user: userId };
        if (completed !== undefined) {
            filter.completed = completed === 'true'; 
        }

        const tasks = await Task.find(filter).sort({ dueDate: 1 });
        if (tasks.length === 0) {
            return res.status(404).json({ message: 'No tasks found for this filter.' });
        }

        return res.status(200).json({
            tasks: tasks.map(task => ({
                ...task._doc,
                formattedDueDate: formatToUKDate(task.dueDate),
                formattedCompletedAt: formatToUKDate(task.completedAt)
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error. Could not fetch tasks.' });
    }
});
  

// Edit a task
app.put('/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params; 
        const { userId, name, dueDate } = req.body;  

        if (!userId || !name || !dueDate) {
            return res.status(400).json({ message: 'User ID, task name, and due date are required.' });
        }

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        if (task.user.toString() !== userId) {
            return res.status(403).json({ message: 'You can only edit your own tasks.' });
        }

        task.name = name;
        task.dueDate = new Date(dueDate);

        await task.save();

        // Add formattedDueDate to the response
        res.status(200).json({ 
            message: 'Task updated successfully.', 
            task: {
                ...task._doc, // Spread the original task fields
                formattedDueDate: formatToUKDate(task.dueDate), 
            } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error. Could not update task.' });
    }
});

// Mark task as completed
app.patch('/tasks/:id/complete', authenticateToken, async (req, res) => {
    console.log(req.body)
    try {
        const { userId } = req.body;
        const { id } = req.params;

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        if (task.user.toString() !== userId) {
            return res.status(403).json({ message: 'You can only update your own tasks.' });
        }

        task.completed = true;
        task.completedAt = new Date();
            
        await task.save();

        res.status(200).json({
            message: 'Task marked as completed.',
            task: {
                ...task._doc,
                formattedDueDate: formatToUKDate(task.dueDate),
                formattedCompletedAt: formatToUKDate(task.completedAt)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error. Could not mark task as completed.' });
    }
});

// Mark a task as incomplete
app.patch('/tasks/:id/incomplete', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        if (task.user.toString() !== userId) {
            return res.status(403).json({ message: 'You can only update your own tasks.' });
        }

        task.completed = false; // Mark as incomplete
        await task.save();

        res.status(200).json({ 
            message: 'Task marked as incomplete.', 
            task: {
                ...task._doc,
                formattedDueDate: formatToUKDate(task.dueDate), 
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error. Could not update task.' });
    }
});

// Delete task
app.delete('/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.body; 
        const { id } = req.params;
        // Validate task ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid task ID' });
        }

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        if (task.user.toString() !== userId) {
            return res.status(403).json({ message: 'You can only delete your own tasks.' });
        }

        await Task.findByIdAndDelete(id);

        res.status(200).json({ message: 'Task deleted successfully.' });
    } catch (error) {
        console.error('Error deleting task:', error);
        return res.status(500).json({ message: 'Server error. Could not delete task.', error: error.message });
    }
});

//Adding goal
app.post('/goals', authenticateToken,  async (req, res) => {
    try {
        const { name, dueDate, userId, category } = req.body;
        if (!name || !dueDate || !userId) {
            return res.status(400).json({ message: 'Goal name, due date, and user ID are required.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Create a new goal
        const newGoal = new Goal({
            name,
            dueDate,
            user: user._id,
            category
        });

        // Save the goal to the database
        await newGoal.save();

        // Add formattedDueDate to the response
        res.status(201).json({
            message: 'Goal created successfully.',
            goal: {
                ...newGoal._doc, // Spread the original goal fields
                formattedDueDate: formatToUKDate(newGoal.dueDate),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error. Could not create goal.' });
    }
});

// Get goals based on completed status
app.get('/goals', authenticateToken, async (req, res) => {
    try {
        const { userId, completed } = req.query;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const filter = { user: userId };
        if (completed !== undefined) {
            filter.completed = completed === 'true'; // Convert string to boolean
        }

        const goals = await Goal.find(filter).sort({ dueDate: 1 });
        if (goals.length === 0) {
            return res.status(404).json({ message: 'No goals found for this filter.' });
        }

        return res.status(200).json({
            goals: goals.map(goal => ({
                ...goal._doc,
                formattedDueDate: formatToUKDate(goal.dueDate),
                formattedCompletedAt: formatToUKDate(goal.completedAt)
            })),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error. Could not fetch goals.' });
    }
});

// Mark goal as completed
app.patch('/goals/:id/complete', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.body;
        const { id } = req.params;

        const goal = await Goal.findById(id);
        if (!goal) {
            return res.status(404).json({ message: 'Goal not found.' });
        }

        if (goal.user.toString() !== userId) {
            return res.status(403).json({ message: 'You can only update your own goals.' });
        }

        goal.completed = true;
        goal.completedAt = new Date();

        await goal.save();

        res.status(200).json({
            message: 'Goal marked as completed.',
            goal: {
                ...goal._doc,
                formattedDueDate: formatToUKDate(goal.dueDate),
                formattedCompletedAt: formatToUKDate(goal.completedAt)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error. Could not mark goal as completed.' });
    }
});

// Mark a goal as incomplete
app.patch('/goals/:id/incomplete', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        const goal = await Goal.findById(id);
        if (!goal) {
            return res.status(404).json({ message: 'Goal not found.' });
        }

        if (goal.user.toString() !== userId) {
            return res.status(403).json({ message: 'You can only update your own goals.' });
        }

        goal.completed = false; // Mark as incomplete
        await goal.save();

        res.status(200).json({ 
            message: 'Goal marked as incomplete.', 
            goal: {
                ...goal._doc,
                formattedDueDate: formatToUKDate(goal.dueDate), 
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error. Could not update goal.' });
    }
});

//Edit goals
app.put('/goals/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, name, dueDate, category } = req.body;

        if (!userId || !name || !dueDate) {
            return res.status(400).json({ message: 'User ID, goal name, and due date are required.' });
        }

        const goal = await Goal.findById(id);
        if (!goal) {
            return res.status(404).json({ message: 'Goal not found.' });
        }

        if (goal.user.toString() !== userId) {
            return res.status(403).json({ message: 'You can only edit your own goals.' });
        }

        goal.name = name;
        goal.dueDate = new Date(dueDate);
        goal.category = category;

        await goal.save();

        res.status(200).json({ 
            message: 'Goal updated successfully.', 
            goal: {
                ...goal._doc, // Spread the original task fields
                formattedDueDate: formatToUKDate(goal.dueDate), 
            } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error. Could not update goal.' });
    }
});

//Delete Goals
app.delete('/goals/:id', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.body;
        const { id } = req.params;
        // Validate goal ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid goal ID' });
        }

        const goal = await Goal.findById(id);
        if (!goal) {
            return res.status(404).json({ message: 'Goal not found.' });
        }

        if (goal.user.toString() !== userId) {
            return res.status(403).json({ message: 'You can only delete your own goals.' });
        }

        await Goal.findByIdAndDelete(id);

        res.status(200).json({ message: 'Goal deleted successfully.' });
    } catch (error) {
        console.error('Error deleting goal:', error);
        return res.status(500).json({ message: 'Server error. Could not delete goal.', error: error.message });
    }
});

//Add history
app.post('/history', authenticateToken, async (req, res) => {
    try {
        const { userId, data, category } = req.body;

        // Validate request
        if (!userId || !data) {
            return res.status(400).json({ message: 'User ID and video data are required.' });
        }

        // Check if the video already exists in the user's history
        const existingHistory = await History.findOne({ userId, 'data.id.videoId': data.id.videoId });
        if (existingHistory) {
            return res.status(200).json({ message: 'Video already exists in history.' });
        }

        // Create a new history entry
        const historyEntry = new History({
            userId, // Pass userId directly; Mongoose will validate it
            data,
            category,
            viewedAt: new Date(),
        });

        // Save to database
        await historyEntry.save();

        return res.status(201).json({ message: 'Video added to history.', history: historyEntry });
    } catch (error) {
        console.error('Error saving to history:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

//Get history
app.get('/history', async (req, res) => {
    try {
        const { userId } = req.query;

        // Validate userId
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Fetch user history, sorted by viewedAt (most recent first)
        const history = await History.find({ userId }).sort({ viewedAt: -1 });

        // Handle no history case
        if (!history || history.length === 0) {
            return res.status(200).json({ message: 'No history found for this user.', history: [] });
        }

        // Respond with history data
        return res.status(200).json({ history });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ message: 'Server error. Could not fetch history.' });
    }
});

//Dete history
app.delete('/history', authenticateToken, async (req, res) => {
    try {
        const { userId, videoId } = req.body; 

        // Validate request
        if (!userId || !videoId) {
            return res.status(400).json({ message: 'User ID and video ID are required.' });
        }

        // Find and remove the specific video from the user's history
        const result = await History.deleteOne({ userId, 'data.id.videoId': videoId });

        // If no document was removed, return a message indicating nothing was found
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Video not found in history.' });
        }

        return res.status(200).json({ message: 'Video removed from history.' });
    } catch (error) {
        console.error('Error deleting history:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

//Add Saved
app.post('/saved', authenticateToken, async (req, res) => {
    try {
        const { userId, data, category } = req.body;
        // Validate request
        if (!userId || !data) {
            return res.status(400).json({ message: 'User ID and video data are required.' });
        }

        // Check if the video already exists in the user's history
        const existingSaved = await Saved.findOne({ userId, 'data.id.videoId': data.id.videoId });
        if (existingSaved) {
            return res.status(200).json({ message: 'Video already exists in saved.' });
        }

        // Create a new history entry
        const savedEntry = new Saved({
            userId, 
            data,
            category,
            savedAt: new Date(),
        });

        // Save to database
        await savedEntry.save();

        return res.status(201).json({ message: 'Video added to saved.', saved: savedEntry });
    } catch (error) {
        console.error('Error saving to Saved:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// Get Saved Videos
app.get('/saved', async (req, res) => {
    try {
        const { userId } = req.query;

        // Validate userId
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Fetch user saved videos, sorted by savedAt (most recent first)
        const savedVideos = await Saved.find({ userId }).sort({ savedAt: -1 });

        // Handle no saved videos case
        if (!savedVideos || savedVideos.length === 0) {
            return res.status(200).json({ message: 'No saved videos found for this user.', saved: [] });
        }

        // Respond with saved videos data
        return res.status(200).json({ saved: savedVideos });
    } catch (error) {
        console.error('Error fetching saved videos:', error);
        res.status(500).json({ message: 'Server error. Could not fetch saved videos.' });
    }
});

// Get Watched Videos
app.get('/saved/watched', async (req, res) => {
    try {
        const { userId } = req.query;

        // Validate userId
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Fetch watched videos, sorted by savedAt (most recent first)
        const watchedVideos = await Saved.find({ userId, watched: true }).sort({ savedAt: -1 });

        // Handle no watched videos case
        if (!watchedVideos || watchedVideos.length === 0) {
            return res.status(200).json({ message: 'No watched videos found for this user.', watched: [] });
        }

        // Respond with watched videos data
        return res.status(200).json({ watched: watchedVideos });
    } catch (error) {
        console.error('Error fetching watched videos:', error);
        res.status(500).json({ message: 'Server error. Could not fetch watched videos.' });
    }
});

// Delete Saved Video
app.delete('/saved', authenticateToken, async (req, res) => {
    try {
        const { userId, videoId } = req.body;

        // Validate request
        if (!userId || !videoId) {
            return res.status(400).json({ message: 'User ID and video ID are required.' });
        }

        // Find and remove the specific video from the user's saved list
        const result = await Saved.deleteOne({ userId, 'data.id.videoId': videoId });

        // If no document was removed, return a message indicating nothing was found
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Video not found in saved.' });
        }

        return res.status(200).json({ message: 'Video removed from saved.' });
    } catch (error) {
        console.error('Error deleting saved video:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});   

// Toggle Watched Status
app.patch('/saved/watched', authenticateToken, async (req, res) => {
    try {
        const { userId, videoId } = req.body;

        // Validate input
        if (!userId || !videoId) {
            return res.status(400).json({ message: 'User ID and video ID are required.' });
        }

        // Find the video and toggle the watched status
        const savedEntry = await Saved.findOne({ userId, 'data.id.videoId': videoId });
        if (!savedEntry) {
            return res.status(404).json({ message: 'Video not found in saved.' });
        }

        // Toggle watched status
        savedEntry.watched = !savedEntry.watched;
        await savedEntry.save();

        return res.status(200).json({ message: 'Watched status updated.', watched: savedEntry.watched });
    } catch (error) {
        console.error('Error toggling watched status:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

//Post new question on the forum
app.post('/questions', authenticateToken, async (req, res) => {
    try {
      const { userId, questionTitle, questionDescription } = req.body;
  
      // Validate required fields
      if (!userId || !questionTitle || !questionDescription) {
        return res.status(400).json({ message: 'All fields are required.' });
      }
  
      // Create a new post
      const newQuestion = new Post({
        title: questionTitle,
        user: userId,
        description: questionDescription,
      });
  
      // Save to database
      const savedQuestion = await newQuestion.save();
  
      return res.status(201).json({
        message: 'Question posted successfully.',
        question: savedQuestion,
      });
    } catch (error) {
      console.error('Error posting question:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
});

//Get user posts
app.get('/questions', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        // Fetch user by ID
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Fetch posts by user
        const userPosts = await Post.find({ user: userId }).sort({ createdAt: -1 });

        // If no posts are found
        if (userPosts.length === 0) {
            return res.status(200).json({ 
                message: 'No posts found for this user.', 
                posts: [] 
            });
        }

        // If posts are found
        return res.status(200).json({ 
            message: 'Posts retrieved successfully.', 
            firstName: user.firstname,  
            lastName: user.lastname,
            posts: userPosts 
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Server error. Could not fetch posts.' });
    }
});

// Edit an existing post
app.put('/questions/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params; 
        const { questionTitle, questionDescription } = req.body;

        if (!questionTitle || !questionDescription) {
            return res.status(400).json({ message: 'Title and description are required.' });
        }

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            { 
                title: questionTitle, 
                description: questionDescription 
            },
            { new: true, runValidators: true } 
        );

        if (!updatedPost) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        return res.status(200).json({
            message: 'Post updated successfully.',
            post: updatedPost,
        });
    } catch (error) {
        console.error('Error updating post:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// Delete a post by ID
app.delete('/questions/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Delete the post (question)
        const deletedPost = await Post.findByIdAndDelete(id);

        if (!deletedPost) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Delete notifications related to this post
        await Notification.deleteMany({ postId: id });

        return res.status(200).json({
            message: 'Post and related notifications deleted successfully.',
            post: deletedPost,
        });
    } catch (error) {
        console.error('Error deleting post and related notifications:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

//Get all posts
app.get('/questions/all', authenticateToken, async (req, res) => {
    try {
        const allPosts = await Post.find({}).populate('user', 'firstname lastname').sort({ createdAt: -1 });
        // If no posts exist
        if (allPosts.length === 0) {
            return res.status(200).json({
                message: 'No posts found.',
                posts: [],
            });
        }

        // If posts exist
        return res.status(200).json({
            message: 'All posts retrieved successfully.',
            posts: allPosts,
        });
    } catch (error) {
        console.error('Error fetching all posts:', error);
        res.status(500).json({ message: 'Server error. Could not fetch posts.' });
    }
});

// Get forum search results
app.get('/questions/search', authenticateToken, async (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.status(400).json({ message: 'Search term is required.' });
    }

    try {
        // Use case-insensitive regex for partial matching
        const posts = await Post.find({
            title: { $regex: q, $options: 'i' },
        }).populate('user', 'firstname lastname');

        return res.status(200).json({
            message: 'Search results fetched successfully.',
            posts,
        });
    } catch (error) {
        console.error('Error searching posts:', error);
        return res.status(500).json({ message: 'Server error. Could not fetch search results.' });
    }
});

// Get a specific post by ID
app.get('/questions/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;  
        // Find the post by ID and populate user information
        const post = await Post.findById(id).populate('user', 'firstname lastname');

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Find all answers associated with the post
        const answers = await PostAnswer.find({ post: id }).populate('user', 'firstname lastname');

        return res.status(200).json({
            message: 'Post retrieved successfully.',
            post: post,
            answers: answers, // Include the answers in the response
        });
    } catch (error) {
        console.error('Error fetching post by ID:', error);
        return res.status(500).json({ message: 'Internal server error. Could not fetch post.' });
    }
});

//Add answer to a question
app.post('/questions/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { answer, userId } = req.body;

    if (!answer) {
        return res.status(400).json({ message: 'Answer content is required.' });
    }

    try {
        // Verify that the post exists
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Create and save the new answer
        const newAnswer = new PostAnswer({
            post: id,
            user: userId,
            answer,
        });

        await newAnswer.save();

        // Increase the post answer count
        post.answersCount += 1;
        await post.save();

        // Populate user details in the newly created answer
        const populatedAnswer = await PostAnswer.findById(newAnswer._id).populate('user', 'firstname lastname');

        // Return the newly created and populated answer
        res.status(201).json({
            message: 'Answer created successfully.',
            answer: populatedAnswer,
        });
    } catch (error) {
        console.error('Error creating answer:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Post a vote to an answer
app.post('/answers/:id/vote', authenticateToken, async (req, res) => {
    const { id } = req.params;  
    const { voteType, userId } = req.body;  

    if (!['upvote', 'downvote'].includes(voteType)) {
        return res.status(400).json({ message: 'Invalid vote type.' });
    }

    try {
        // Find the answer by ID
        const answer = await PostAnswer.findById(id);
        if (!answer) {
            return res.status(404).json({ message: 'Answer not found.' });
        }

        // Check if the user has already voted on this answer
        const existingVote = answer.votes.find(vote => vote.userId.toString() === userId);

        if (existingVote) {
            // If the user has voted, update their existing vote
            if (existingVote.voteType === voteType) {
                // If the user is trying to vote the same way, remove their vote
                answer.votes = answer.votes.filter(vote => vote.userId.toString() !== userId);
                voteType === 'upvote' ? answer.upvotes-- : answer.downvotes--;
            } else {
                // If the user is changing their vote, update the vote type
                existingVote.voteType = voteType;
                voteType === 'upvote' ? answer.upvotes++ : answer.downvotes++;
                voteType === 'downvote' ? answer.upvotes-- : answer.downvotes--;
            }
        } else {
            // If the user hasn't voted yet, add their vote
            answer.votes.push({ userId, voteType });
            voteType === 'upvote' ? answer.upvotes++ : answer.downvotes++;
        }

        await answer.save();

        res.status(200).json({
            message: 'Vote processed successfully.',
            updatedAnswer: {
                upvotes: answer.upvotes,
                downvotes: answer.downvotes,
                votes: answer.votes,
            },
        });
    } catch (error) {
        console.error('Error processing vote:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Delete answer and related notifications
app.delete('/answers/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { userId } = req.query;

    try {
        // Find the answer by ID
        const answer = await PostAnswer.findById(id);
        if (!answer) {
            return res.status(404).json({ message: 'Answer not found.' });
        }

        // Check if the user is the owner of the answer
        if (answer.user.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this answer.' });
        }

        // Delete the notification related to this answer
        await Notification.findOneAndDelete({ answerId: id });

        // Remove the answer from the database
        await PostAnswer.findByIdAndDelete(id);

        // Decrease the post's answer count
        const post = await Post.findById(answer.post);
        if (post) {
            post.answersCount -= 1;
            await post.save();
        }

        res.status(200).json({ message: 'Answer and its notification deleted successfully.' });
    } catch (error) {
        console.error('Error deleting answer:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

//Save notification to be sent and their recipients
app.post('/notification', authenticateToken, async (req, res) => {
    const { userId, type, postId, answerId } = req.body;

    try {
        if (type === 'question') {
            // Find all users except the one who posted the question
            const usersToNotify = await User.find({ _id: { $ne: userId } }).select('_id');
            const recipientIds = usersToNotify.map(user => user._id);
            
            // Create a single notification with an array of recipients
            const newNotification = new Notification({
                type,
                postId,
                triggeredBy: userId,
                recipients: recipientIds, // Save recipients as an array
            });
            
            await newNotification.save();

            return res.status(201).json({ message: 'Notifications for the question are saved.', notification: newNotification });
        } else if (type === 'answer') {
            // Find the user who posted the original question
            const question = await Post.findById(postId).select('user');

            if (!question) {
                return res.status(404).json({ message: 'Question not found.' });
            }

            if (question.user.equals(userId)) {
                return res.status(200).json({ message: 'Answer posted by the question author, no notification needed.' });
            } else {
                // Create a single notification for the question's author
                const newNotification = new Notification({
                    type,
                    postId,
                    answerId,
                    triggeredBy: userId,
                    recipients: [question.user], // Save the question author as the only recipient
                });

                await newNotification.save();

                return res.status(201).json({ message: 'Notification for the answer is saved.', notification: newNotification });
            }
        } else {
            return res.status(400).json({ message: 'Invalid notification type.' });
        }
    } catch (error) {
        console.error('Error saving notification:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

//Send notifcation 
app.get('/notification', authenticateToken, async (req, res) => {
    const { userId } = req.query;
    try {
        const notifications = await Notification.find({ recipients: userId }) 
            .populate('triggeredBy', 'firstname lastname') 
            .sort({ createdAt: -1 });

        return res.status(200).json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

//Clear notification
app.post('/notification/click', authenticateToken, async (req, res) => {
    const { userId, notificationId } = req.body;
    try {
        // Update the notification by removing the user from the recipients array
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { $pull: { recipients: userId } }, // Remove the userId from the recipients array
            { new: true } // Return the updated document
        );
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found.' });
        }
        // Check if there are any remaining recipients
        if (notification.recipients.length === 0) {
            // If no more recipients, delete the notification from the database
            await Notification.findByIdAndDelete(notificationId);
            return res.status(200).json({ message: 'Notification cleared and deleted successfully.' });
        }

        return res.status(200).json({ message: 'Notification updated successfully.', notification });
    } catch (error) {
        console.error('Error updating notification:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// Add Feedback
app.post('/feedback', authenticateToken, async (req, res) => {
    try {
        const { userId, savedVideoId, feedbackText } = req.body;

        // Validate request
        if (!userId || !savedVideoId || !feedbackText) {
            return res.status(400).json({ message: 'User ID, saved video ID, and feedback text are required.' });
        }

        // Check if the video exists in the saved collection
        const savedVideo = await Saved.findById(savedVideoId);
        if (!savedVideo) {
            return res.status(404).json({ message: 'Saved video not found.' });
        }

        // Create a new feedback entry
        const feedbackEntry = new Feedback({
            userId,
            savedVideoId,
            feedbackText,
        });

        // Save feedback to the database
        await feedbackEntry.save();

        return res.status(201).json({ message: 'Feedback submitted successfully.', feedback: feedbackEntry });
    } catch (error) {
        console.error('Error saving feedback:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// Get User's Feedback for a Video
app.get('/feedback', authenticateToken, async (req, res) => {
    try {
        const { userId, savedVideoId } = req.query;

        // Validate request parameters
        if (!userId || !savedVideoId) {
            return res.status(400).json({ message: 'User ID and saved video ID are required.' });
        }

        // Check if the user exists 
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Fetch feedback for the given userId and savedVideoId
        const feedback = await Feedback.findOne({ userId, savedVideoId });

        // Handle case where no feedback is found
        if (!feedback) {
            return res.status(404).json({ message: 'No feedback found for this video.' });
        }

        // Return feedback
        return res.status(200).json({ feedback });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// Update Feedback
app.put('/feedback/:feedbackId', authenticateToken, async (req, res) => {
    try {
        const { feedbackId } = req.params;
        const { feedbackText } = req.body;

        // Validate request body
        if (!feedbackText) {
            return res.status(400).json({ message: 'Feedback text is required.' });
        }

        // Find the feedback by its ID
        const feedback = await Feedback.findById(feedbackId);
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found.' });
        }

        // Update the feedback text
        feedback.feedbackText = feedbackText;

        // Save the updated feedback
        await feedback.save();

        return res.status(200).json({ message: 'Feedback updated successfully.', feedback });
    } catch (error) {
        console.error('Error updating feedback:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// Delete Feedback
app.delete('/feedback/:feedbackId', authenticateToken, async (req, res) => {
    try {
        const { feedbackId } = req.params;

        // Find and delete feedback by its ID
        const feedback = await Feedback.findByIdAndDelete(feedbackId);

        // If feedback not found, return an error
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found.' });
        }

        // Return success response
        return res.status(200).json({ message: 'Feedback deleted successfully.' });
    } catch (error) {
        console.error('Error deleting feedback:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

//Sentiment analysis
app.get('/sentiment', authenticateToken, async (req, res) => {
    try {
        const { feedback } = req.query;

        if (!feedback) {
            return res.status(400).json({ error: 'Feedback not provided' });
        }
        const sentiment = vader.SentimentIntensityAnalyzer.polarity_scores(feedback);
        const finalScore = ((sentiment.compound + 1) / 2) * 100;
        // Send back only the final sentiment score
        return res.status(200).json({ score: finalScore });

    } catch (error) {
        console.error("Error processing sentiment:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Get Recommendations
const client = new HfInference(process.env.HF_API_TOKEN);

const getGoalsForRecommendations = async (userId) => {
    try {
        if (!userId) {
            return { message: 'User ID is required.' };
        }

        const user = await User.findById(userId);
        if (!user) {
            return { message: 'User not found.' };
        }

        // Fetch completed goals (only the name)
        const completedGoals = await Goal.find({ user: userId, completed: true }).select('name');
        // Fetch incompleted goals (only the name)
        const incompletedGoals = await Goal.find({ user: userId, completed: false }).select('name');

        // Check if there are no goals
        if (completedGoals.length === 0 && incompletedGoals.length === 0) {
            return { completed: [], incompleted: [], noGoals: true };
        }

        return {
            completed: completedGoals.map(goal => goal.name),
            incompleted: incompletedGoals.map(goal => goal.name),
            noGoals: false,
        };
    } catch (error) {
        console.error(error);
        return { message: 'Server error. Could not fetch goals for recommendations.' };
    }
};

const createRecommendationSearchTerm = async (incompleteGoals, completeGoals) => {
    try {
        // Prepare the input prompt by combining incomplete and complete goals
        const prompt = `
            A user has completed some of their goals but some are pending. These are their completed goals: 
            ${completeGoals.join(', ')}
            These are their incompleted goals: ${incompleteGoals.join(', ')}

            Based on the information above, generate 3 different search terms to search on YouTube that will help recommend the user what to watch next. Only return the search terms in the response (no extra text).
        `;

        // Call Hugging Face API to generate text
        const response = await client.chatCompletion({
            model: "microsoft/Phi-3-mini-4k-instruct",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 100
        });

        // Extract the generated search terms
        const generatedContent = response.choices[0].message.content;
        const searchTerms = generatedContent.split('\n')
                                            .map(line => line.replace(/^\d+\.\s*\*\*|^\d+\.\s*/, '').replace(/\*\*/g, '').trim())
                                            .filter(line => line.length > 0)
                                            .slice(0, 3);;

        return searchTerms;
    } catch (error) {
        console.error('Error generating search terms:', error.message);
        return ['Sorry, there was an issue generating search terms.'];
    }
};

app.get('/recommendations', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.query;
        const { completed, incompleted, noGoals } = await getGoalsForRecommendations(userId);
        // If there are no goals, return early
        if (noGoals) {
            return res.json({ recommendations: [] });
        }

        const searchTerms = await createRecommendationSearchTerm(completed, incompleted);

        // Fetch watched videos for the user
        const watchedVideos = await Saved.find({ userId, watched: true }).select('data.id.videoId');
        const watchedVideoIds = new Set(watchedVideos.map(video => video.data.id.videoId));

        const result = [];
        const addedVideoIds = new Set(); // Track already added video IDs

        for (let q of searchTerms) {
            const apiUrl = `${process.env.BASE_URL}?part=snippet&q=${encodeURIComponent(q)}&type=video&videoDuration=long&maxResults=4&key=${process.env.API_KEY}`;
            const response = await fetch(apiUrl);
            const data = await response.json();
            for (let item of data.items) {
                const videoId = item.id.videoId;

                // Skip if the video is watched or already in the result set
                if (!watchedVideoIds.has(videoId) && !addedVideoIds.has(videoId)) {
                    result.push(item);
                    addedVideoIds.add(videoId); 
                }
            }
        }

        res.json({ recommendations: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching recommendations' });
    }
});
  
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});