import express from 'express';
import { getConversation, sendMessage, getConversations } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getConversations)
  .post(protect, sendMessage);

router.route('/:otherUserId')
  .get(protect, getConversation);

export default router;
