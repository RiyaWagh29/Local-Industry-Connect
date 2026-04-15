import express from 'express';
import { getResources, shareResource } from '../controllers/resourceController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getResources)
  .post(protect, upload.single('file'), shareResource);

export default router;
