import express from 'express';
import { bookSession, getSessions, updateSessionStatus, getAvailableSlots } from '../controllers/sessionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { check } from 'express-validator';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { requireIdempotency } from '../middleware/idempotencyMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getSessions);

router.route('/available')
  .get(protect, getAvailableSlots);

router.route('/book')
  .post(
    protect,
    requireIdempotency,
    [
      check('mentorId', 'Mentor ID is required').not().isEmpty(),
      check('start', 'Start time is required and must be an ISO8601 Date').isISO8601(),
      check('end', 'End time is required and must be an ISO8601 Date').isISO8601()
    ],
    validateRequest,
    bookSession
  );

router.route('/:id')
  .put(protect, updateSessionStatus);

export default router;
