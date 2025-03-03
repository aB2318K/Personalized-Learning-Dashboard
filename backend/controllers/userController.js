import mongoose from 'mongoose';
import User from '../models/User.js';
import Post from '../models/Post.js';
import PostAnswer from '../models/PostAnswer.js';
import Task from '../models/Task.js';
import Goal from '../models/Goal.js';
import History from '../models/History.js';
import Saved from '../models/Saved.js';
import Notification from '../models/Notification.js';
import Feedback from '../models/Feedback.js';
import { hashPassword, comparePasswords } from '../utils/helpers.js';

export const getUser = async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { infoName } = req.query;
    const { info } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Update logic
    if (infoName === 'firstname') user.firstname = info;
    else if (infoName === 'lastname') user.lastname = info;
    else return res.status(400).json({ message: 'Invalid info name.' });

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

export const changePassword = async (req, res) => {
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
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID.' });
    }

    // Delete related data
    await Promise.all([
      Post.deleteMany({ user: userId }),
      PostAnswer.deleteMany({ user: userId }),
      Task.deleteMany({ user: userId }),
      Goal.deleteMany({ user: userId }),
      History.deleteMany({ userId }),
      Saved.deleteMany({ userId }),
      Notification.deleteMany({ triggeredBy: userId }),
      Feedback.deleteMany({ userId }),
      User.deleteOne({ _id: userId })
    ]);

    res.status(200).json({ message: 'User and related data deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Server error.', error: error.message });
  }
};