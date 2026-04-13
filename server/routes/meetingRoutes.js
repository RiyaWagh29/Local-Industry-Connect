import express from 'express';
import {
  requestMeeting,
  getMentorMeetings,
  getStudentMeetings,
  updateMeetingStatus
} from '../controllers/meetingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, requestMeeting);

router.route('/mentor/:id')
  .get(protect, getMentorMeetings);

router.route('/student/:id')
  .get(protect, getStudentMeetings);

router.route('/:id')
  .put(protect, updateMeetingStatus);

export default router;
