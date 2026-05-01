import express from 'express';
import { check } from 'express-validator';
import { registerUser, loginUser, refreshToken, sendOtp, verifyOtp } from '../controllers/authController.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post(
  '/register',
  upload.single('officeIdCard'),
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  validateRequest,
  registerUser
);

router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  validateRequest,
  loginUser
);

router.post(
  '/send-otp',
  [
    check('email', 'Please include a valid email').isEmail(),
  ],
  validateRequest,
  sendOtp
);

router.post(
  '/verify-otp',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('otp', 'OTP must be 6 digits').isLength({ min: 6, max: 6 }),
  ],
  validateRequest,
  verifyOtp
);

router.post('/refresh', refreshToken);

export default router;
