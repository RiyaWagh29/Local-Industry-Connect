import Rating from '../models/Rating.js';
import User from '../models/User.js';

// @desc    Submit a rating
// @route   POST /api/ratings
// @access  Private (Students)
export const submitRating = async (req, res) => {
  try {
    const { mentor_id, score, feedback } = req.body;
    
    const rating = await Rating.create({
      mentor_id,
      student_id: req.user._id,
      score,
      feedback,
    });

    // Update mentor average rating
    const ratings = await Rating.find({ mentor_id });
    const averageRating = ratings.reduce((acc, current) => acc + current.score, 0) / ratings.length;
    
    await User.findByIdAndUpdate(mentor_id, { averageRating });

    res.status(201).json({ success: true, data: rating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get ratings for a mentor
// @route   GET /api/ratings/mentor/:id
// @access  Private
export const getMentorRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ mentor_id: req.params.id }).populate('student_id', 'name avatar');
    res.json({ success: true, data: ratings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
