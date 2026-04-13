import express from 'express';
import { updateProgress, getProgress } from '../controllers/progressController.js';
import { protect, mentorOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, mentorOnly, updateProgress);

router.route('/:studentId')
  .get(protect, getProgress);

export default router;
