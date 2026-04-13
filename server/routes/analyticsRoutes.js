import express from 'express';
import User from '../models/User.js';
import Session from '../models/Session.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get Mentor Analytics
// @route   GET /api/analytics/mentors
// @access  Private
router.get('/mentors', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const pipeline = [
      { $match: { role: 'mentor' } },
      { $skip: skip },
      { $limit: limit },
      { 
        $lookup: {
          from: 'sessions', // Mongoose model 'Session' resolves to 'sessions' collection natively
          localField: '_id',
          foreignField: 'mentor',
          as: 'mentorSessions'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          skills: 1,
          averageRating: 1,
          totalSessionsHandled: { $size: '$mentorSessions' },
          completedSessions: {
            $size: {
              $filter: {
                input: '$mentorSessions',
                as: 'session',
                cond: { $eq: ['$$session.status', 'completed'] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          successRate: {
            $cond: [
              { $eq: ['$totalSessionsHandled', 0] },
              0,
              { $multiply: [{ $divide: ['$completedSessions', '$totalSessionsHandled'] }, 100] }
            ]
          }
        }
      },
      { $sort: { successRate: -1, averageRating: -1 } }
    ];

    const results = await User.aggregate(pipeline);
    res.json({ success: true, message: 'Analytics generated', data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get Overall Platform Analytics
// @route   GET /api/analytics/platform
// @access  Private
router.get('/platform', protect, async (req, res) => {
  try {
    const totalMentors = await User.countDocuments({ role: 'mentor' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalSessionsConfirmed = await Session.countDocuments({ status: 'confirmed' });
    const totalSessionsCompleted = await Session.countDocuments({ status: 'completed' });

    res.json({ 
        success: true, 
        message: 'Platform Stats generated', 
        data: { 
            totalMentors, 
            totalStudents, 
            totalSessionsConfirmed, 
            totalSessionsCompleted 
        } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
