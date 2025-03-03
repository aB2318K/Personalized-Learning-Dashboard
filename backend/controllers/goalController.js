import mongoose from 'mongoose';
import Goal from '../models/Goal.js';
import User from '../models/User.js';
import { formatToUKDate } from '../utils/helpers.js';

export const createGoal = async (req, res) => {
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
};

export const getGoals = async (req, res) => {
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
};

export const updateGoal = async (req, res) => {
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
};

export const markGoalComplete = async (req, res) => {
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
};

export const markGoalIncomplete = async (req, res) => {
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
};

export const deleteGoal = async (req, res) => {
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
};