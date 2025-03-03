import express from 'express';
import { 
  addHistory,
  getHistory,
  deleteHistory,
  addSaved,
  getSaved,
  getWatched,
  deleteSaved,
  toggleWatched
} from '../controllers/mediaController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// History routes
router.post('/history', authenticateToken, addHistory);
router.get('/history', getHistory);
router.delete('/history', authenticateToken, deleteHistory);

// Saved routes
router.post('/saved', authenticateToken, addSaved);
router.get('/saved', getSaved);
router.get('/saved/watched', getWatched);
router.delete('/saved', authenticateToken, deleteSaved);
router.patch('/saved/watched', authenticateToken, toggleWatched);

export default router;