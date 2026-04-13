import express from 'express';
import {
  submitRating,
  getMentorRatings
} from '../controllers/ratingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, submitRating);

router.route('/mentor/:id')
  .get(protect, getMentorRatings);

export default router;
