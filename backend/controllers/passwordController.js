import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import { hashPassword, comparePasswords } from '../utils/helpers.js';

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const resetToken = jwt.sign(
      { id: user.id },
      process.env.JWT_RESET_SECRET_KEY,
      { expiresIn: '2h' }
    );

    user.resetToken = resetToken;
    user.resetId = crypto.randomBytes(16).toString('hex');
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });

    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset',
      text: `Reset link: https://yourdomain.com/reset/${user.resetId}`
    });

    res.status(200).json({ message: 'Password reset email sent.' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

export const validateResetToken = async (req, res) => {
  try {
    const { resetId } = req.query;
    const user = await User.findOne({ resetId });
    
    if (!user) return res.status(404).json({ message: 'Invalid reset link.' });
    
    res.status(200).json({ resetToken: user.resetToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { newPassword, resetToken } = req.body;
    
    const decoded = jwt.verify(resetToken, process.env.JWT_RESET_SECRET_KEY);
    if (Date.now() >= decoded.exp * 1000) {
      return res.status(400).json({ message: 'Reset token expired.' });
    }

    const user = await User.findOne({
      _id: decoded.id,
      resetToken
    });

    if (!user) return res.status(404).json({ message: 'Invalid token.' });

    if (await comparePasswords(newPassword, user.password)) {
      return res.status(400).json({ message: 'Use a new password.' });
    }

    user.password = await hashPassword(newPassword);
    user.resetToken = undefined;
    user.resetId = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};