import Progress from '../models/Progress.js';

// @desc    Create or Update Progress
// @route   POST /api/progress
// @access  Private (Mentor)
export const updateProgress = async (req, res) => {
  try {
    const { studentId, goals, progressPercentage, feedback } = req.body;

    let progress = await Progress.findOne({ student: studentId, mentor: req.user._id });

    if (progress) {
      // Update existing
      progress.goals = goals || progress.goals;
      if (progressPercentage !== undefined) progress.progressPercentage = progressPercentage;
      if (feedback) progress.feedback = feedback;

      progress = await progress.save();
    } else {
      // Create new
      progress = await Progress.create({
        student: studentId,
        mentor: req.user._id,
        goals: goals || [],
        progressPercentage: progressPercentage || 0,
        feedback: feedback || ''
      });
    }

    res.json({ success: true, message: 'Progress updated', data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get progress for a student
// @route   GET /api/progress/:studentId
// @access  Private
export const getProgress = async (req, res) => {
  try {
    // If student makes request, studentId from params is verified against req.user._id
    if (req.user.role === 'student' && req.params.studentId !== req.user._id.toString()) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Mentor can fetch their specific student's progress
    const query = { student: req.params.studentId };
    if (req.user.role === 'mentor') {
        query.mentor = req.user._id;
    }

    const progressLogs = await Progress.find(query).populate('mentor', 'name').populate('student', 'name');
    
    res.json({ success: true, message: 'Progress retrieved', data: progressLogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
