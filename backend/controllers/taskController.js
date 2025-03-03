import mongoose from 'mongoose';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { formatToUKDate } from '../utils/helpers.js';

export const createTask = async (req, res) => {
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
};

export const getTasks = async (req, res) => {
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
};

export const updateTask = async (req, res) => {
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
};

export const markTaskComplete = async (req, res) => {
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
};

export const markTaskIncomplete = async (req, res) => {
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
};

export const deleteTask = async (req, res) => {
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
};