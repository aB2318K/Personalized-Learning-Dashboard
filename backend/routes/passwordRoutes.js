import express from 'express';
import {
  requestPasswordReset,
  validateResetToken,
  resetPassword
} from '../controllers/passwordController.js';

const router = express.Router();

router.post('/reset', requestPasswordReset);
router.get('/reset-password', validateResetToken);
router.post('/reset-password', resetPassword);

export default router;