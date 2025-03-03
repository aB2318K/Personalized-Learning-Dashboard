import express from 'express';
import { 
  createTask,
  getTasks,
  updateTask,
  markTaskComplete,
  markTaskIncomplete,
  deleteTask
} from '../controllers/taskController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/tasks', authenticateToken, createTask);
router.get('/tasks', authenticateToken, getTasks);
router.put('/tasks/:id', authenticateToken, updateTask);
router.patch('/tasks/:id/complete', authenticateToken, markTaskComplete);
router.patch('/tasks/:id/incomplete', authenticateToken, markTaskIncomplete);
router.delete('/tasks/:id', authenticateToken, deleteTask);

export default router;