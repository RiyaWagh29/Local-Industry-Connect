import express from 'express';
import {
  createCommunity,
  getMentorCommunities,
  getAllCommunities,
  joinCommunity
} from '../controllers/communityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createCommunity)
  .get(protect, getAllCommunities);

router.route('/mentor/:mentorId')
  .get(protect, getMentorCommunities);

router.route('/:id/join')
  .post(protect, joinCommunity);

export default router;
