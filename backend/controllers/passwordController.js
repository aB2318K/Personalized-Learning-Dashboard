import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import { hashPassword, comparePasswords } from '../utils/helpers.js';

export const requestPasswordReset = async (req, res) => {
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
};

export const validateResetToken = async (req, res) => {
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
};

export const resetPassword = async (req, res) => {
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
};