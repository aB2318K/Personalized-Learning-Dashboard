import express from 'express';
import { 
  createFeedback,
  getFeedback,
  updateFeedback,
  deleteFeedback,
  analyzeSentiment
} from '../controllers/feedbackController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/feedback', authenticateToken, createFeedback);
router.get('/feedback', authenticateToken, getFeedback);
router.put('/feedback/:feedbackId', authenticateToken, updateFeedback);
router.delete('/feedback/:feedbackId', authenticateToken, deleteFeedback);
router.get('/sentiment', authenticateToken, analyzeSentiment);

export default router;