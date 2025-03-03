import express from 'express';
import { 
  getUser,
  updateUser,
  changePassword,
  deleteUser
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Keep your original endpoints
router.get('/user', authenticateToken, getUser); 
router.put('/user/:userId', authenticateToken, updateUser); 
router.put('/user/:userId/password', authenticateToken, changePassword);
router.delete('/user', authenticateToken, deleteUser); 

export default router;