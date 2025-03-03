import express from 'express';
import { 
  createPost,
  getPosts,
  updatePost,
  deletePost,
  getAllPosts,
  searchPosts,
  getPostDetails,
  createAnswer,
  handleVote,
  deleteAnswer,
  manageNotification,
  fetchNotifications,
  clearNotification
} from '../controllers/forumController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Post routes
router.post('/questions', authenticateToken, createPost);
router.get('/questions', authenticateToken, getPosts);
router.put('/questions/:id', authenticateToken, updatePost);
router.delete('/questions/:id', authenticateToken, deletePost);
router.get('/questions/all', authenticateToken, getAllPosts);
router.get('/questions/search', authenticateToken, searchPosts);
router.get('/questions/:id', authenticateToken, getPostDetails);

// Answer routes
router.post('/questions/:id', authenticateToken, createAnswer);
router.post('/answers/:id/vote', authenticateToken, handleVote);
router.delete('/answers/:id', authenticateToken, deleteAnswer);

// Notification routes
router.post('/notification', authenticateToken, manageNotification);
router.get('/notification', authenticateToken, fetchNotifications);
router.post('/notification/click', authenticateToken, clearNotification);

export default router;