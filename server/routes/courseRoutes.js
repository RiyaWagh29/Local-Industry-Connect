import express from 'express';
import { check } from 'express-validator';
import { createCourse, getCourseById, getCourses } from '../controllers/courseController.js';
import { protect, mentorOnly } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getCourses)
  .post(
    protect,
    mentorOnly,
    [
      check('name', 'Course name is required').not().isEmpty(),
      check('description', 'Course description is required').not().isEmpty(),
      check('pricingType', 'Pricing type must be free or paid').isIn(['free', 'paid']),
      check('duration', 'Course duration is required').not().isEmpty(),
    ],
    validateRequest,
    createCourse
  );

router.route('/:id')
  .get(protect, getCourseById);

export default router;
