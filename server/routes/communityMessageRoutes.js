import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getCommunityMessages, sendCommunityMessage } from '../controllers/communityMessageController.js';

const router = express.Router();

router.route('/:communityId')
  .get(protect, getCommunityMessages)
  .post(protect, sendCommunityMessage);

export default router;
