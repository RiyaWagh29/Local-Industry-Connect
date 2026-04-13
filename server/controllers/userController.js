import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import MetricsService from '../services/MetricsService.js';

// @desc    Get logged in user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({ success: true, message: 'Profile fetched', data: user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const mentors = await User.find({ role: "mentor" });

    const leaderboard = mentors
      .map((mentor) => {
        const ratings = mentor.ratings || [];

        const avg =
          ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
            : 0;

        return {
          id: mentor._id,
          name: mentor.name,
          email: mentor.email,
          averageRating: avg,
          totalRatings: ratings.length,
        };
      })
      .sort((a, b) => b.averageRating - a.averageRating);

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leaderboard",
    });
  }
};

// @desc    Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.bio = req.body.bio || user.bio;
      user.company = req.body.company || user.company;
      user.experience = req.body.experience || user.experience;
      user.guidance = req.body.guidance || user.guidance;
      user.goals = req.body.goals || user.goals;
      user.onboarding_completed = req.body.onboarding_completed ?? user.onboarding_completed;
      user.skills = req.body.skills || user.skills;
      user.industries = req.body.industries || user.industries;

      const updatedUser = await user.save();
      res.json({ success: true, message: 'Profile updated', data: updatedUser });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all mentors
export const getAllMentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor' }).select('-password');
    res.json({ success: true, message: 'All Mentors retrieved', data: mentors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get matched mentors based on student interests
export const getMatchedMentors = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const mentors = await User.find({ role: 'mentor', skills: { $in: student.interests || [] } }).select('-password');
    res.json({ success: true, data: mentors });
  } catch (error) { res.status(500).json({ success: false }); }
};

// @desc    Rate a mentor
export const rateMentor = async (req, res) => {
  try {
    const { score, feedback } = req.body;
    const mentor = await User.findById(req.params.id);
    if (!mentor || mentor.role !== 'mentor') return res.status(404).json({ success: false, message: 'Mentor not found' });
    mentor.ratings.push({ student: req.user._id, score: Number(score), feedback });
    mentor.averageRating = mentor.ratings.reduce((acc, item) => item.score + acc, 0) / mentor.ratings.length;
    await mentor.save();
    res.status(201).json({ success: true, message: 'Rating added', data: { averageRating: mentor.averageRating } });
  } catch (error) { res.status(500).json({ success: false }); }
};

// @desc    Get all users (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const users = await User.find({}).select('-password -__v').skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await User.countDocuments();
    res.json({ success: true, data: users, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) { res.status(500).json({ success: false }); }
};

// @desc    Promote user to admin
export const promoteToAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.role = 'admin';
    await user.save();
    res.json({ success: true, message: 'User promoted' });
  } catch (error) { res.status(500).json({ success: false }); }
};

// @desc    Toggle user active status
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
  } catch (error) { res.status(500).json({ success: false }); }
};

// @desc    Get administrative audit logs
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({}).populate('actorId', 'name').sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: logs });
  } catch (error) { res.status(500).json({ success: false }); }
};

// @desc    Get administrative metrics
export const getAdminMetrics = async (req, res) => {
    try {
      const metrics = MetricsService.getSnapshot();
      res.json({ success: true, data: metrics });
    } catch (error) { res.status(500).json({ success: false }); }
};


// @desc    Export users to CSV
export const exportUsersCSV = async (req, res) => {
    try {
        res.setHeader('Content-Type', 'text/csv');
        res.write('Name,Email,Role,Status\n');
        const users = await User.find({});
        users.forEach(u => res.write(`${u.name},${u.email},${u.role},${u.isActive}\n`));
        res.end();
    } catch (error) { res.status(500).send('Export failed'); }
};
