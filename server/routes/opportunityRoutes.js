import express from 'express';
import { check } from 'express-validator';
import { createOpportunity, getOpportunities } from '../controllers/opportunityController.js';
import { protect, mentorOnly } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getOpportunities)
  .post(
    protect,
    mentorOnly,
    [
      check('communityId', 'Community ID is required').not().isEmpty(),
      check('type', 'Opportunity type is required').isIn(['job', 'internship', 'workshop', 'field visit', 'industry visit']),
      check('company', 'Company name is required').not().isEmpty(),
    ],
    validateRequest,
    createOpportunity
  );

export default router;
