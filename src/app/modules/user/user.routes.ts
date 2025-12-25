import express from 'express';
import {
  registerUser,
  signInUser,
  logoutUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from './user.controller.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', signInUser);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);

export const UserRoutes = router;
