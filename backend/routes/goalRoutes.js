import express from 'express';
import { 
  createGoal,
  getGoals,
  updateGoal,
  markGoalComplete,
  markGoalIncomplete,
  deleteGoal
} from '../controllers/goalController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/goals', authenticateToken, createGoal);
router.get('/goals', authenticateToken, getGoals);
router.put('/goals/:id', authenticateToken, updateGoal);
router.patch('/goals/:id/complete', authenticateToken, markGoalComplete);
router.patch('/goals/:id/incomplete', authenticateToken, markGoalIncomplete);
router.delete('/goals/:id', authenticateToken, deleteGoal);

export default router;