import express from 'express';
import { 
  searchYouTube,
  getRecommendations
} from '../controllers/youtubeController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/search', searchYouTube);
router.get('/recommendations', authenticateToken, getRecommendations);

export default router;