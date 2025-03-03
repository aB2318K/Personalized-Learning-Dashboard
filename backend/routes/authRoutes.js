import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { 
  loginUser, 
  signUpUser 
} from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/signup', signUpUser);

router.get('/authenticate', authenticateToken, (req, res) => {
    res.json({ 
      message: 'You have been granted protected access', 
      user: req.user 
    });
});

export default router;