import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import Community from '../models/Community.js';
import MetricsService from '../services/MetricsService.js';
import { config } from '../config/env.js';
import { uploadBufferToSupabase } from '../services/storageService.js';

// @desc    Get logged in user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      // Adding followers count or array length to the payload
      const userData = user.toObject();
      userData.followersCount = userData.followers ? userData.followers.length : 0;
      userData.followingCount = userData.following ? userData.following.length : 0;
      res.json({ success: true, message: 'Profile fetched', data: userData });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const mentors = await User.find({ role: "mentor" }).lean();

    const leaderboard = mentors
      .map((mentor) => {
        const ratings = mentor.ratings || [];
        const avg = typeof mentor.averageRating === "number"
          ? mentor.averageRating
          : (ratings.length > 0
              ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
              : 0);

        return {
          _id: mentor._id,
          name: mentor.name,
          role: mentor.role,
          company: mentor.company || "",
          industry: Array.isArray(mentor.industries) ? mentor.industries[0] : mentor.industry,
          avatar: mentor.avatar,
          averageRating: avg,
          totalRatings: ratings.length,
        };
      })
      .sort((a, b) => b.averageRating - a.averageRating || b.totalRatings - a.totalRatings);

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
      const parseValue = (value, fallback) => {
        if (value === undefined) return fallback;
        if (typeof value !== 'string') return value;

        const trimmed = value.trim();
        if (!trimmed) return typeof fallback === 'string' ? '' : fallback;

        try {
          return JSON.parse(trimmed);
        } catch {
          if (typeof fallback === 'number') {
            const numeric = Number(trimmed);
            return Number.isNaN(numeric) ? fallback : numeric;
          }
          if (typeof fallback === 'boolean') {
            return trimmed === 'true';
          }
          return trimmed;
        }
      };

      const uploadedAvatar = req.file
        ? await uploadBufferToSupabase({
            bucket: config.avatarBucket,
            file: req.file,
            folder: 'avatars',
          })
        : null;

      user.name = parseValue(req.body.name, user.name) || user.name;
      user.email = parseValue(req.body.email, user.email) || user.email;
      user.bio = parseValue(req.body.bio, user.bio);
      user.company = parseValue(req.body.company, user.company);
      user.experience = parseValue(req.body.experience, user.experience);
      user.guidance = parseValue(req.body.guidance, user.guidance);
      user.goals = parseValue(req.body.goals, user.goals);
      user.avatar = uploadedAvatar?.publicUrl || parseValue(req.body.avatar, user.avatar) || user.avatar;
      user.onboarding_completed = parseValue(req.body.onboarding_completed, user.onboarding_completed);
      user.skills = parseValue(req.body.skills, user.skills);
      user.industries = parseValue(req.body.industries, user.industries);

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
    const mentors = await User.find({ role: 'mentor' }).select('-password').lean();
    
    const mentorsWithCounts = await Promise.all(mentors.map(async (m) => {
      const communitiesCount = await Community.countDocuments({ mentor_id: m._id });
      return { 
        ...m, 
        communitiesCount, 
        followersCount: m.followers ? m.followers.length : 0 
      };
    }));

    res.json({ success: true, message: 'All Mentors retrieved', data: mentorsWithCounts });
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

// @desc    Toggle follow a mentor
export const toggleFollowMentor = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    const mentor = await User.findById(req.params.id);

    if (!student || !mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ success: false, message: 'User or Mentor not found' });
    }

    const isFollowing = mentor.followers.includes(student._id);

    if (isFollowing) {
      // Unfollow
      mentor.followers = mentor.followers.filter(id => id.toString() !== student._id.toString());
      student.following = student.following.filter(id => id.toString() !== mentor._id.toString());
    } else {
      // Follow
      mentor.followers.push(student._id);
      student.following.push(mentor._id);
    }

    await mentor.save();
    await student.save();

    res.json({
      success: true,
      message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      data: {
        isFollowing: !isFollowing,
        followersCount: mentor.followers.length
      }
    });

  } catch (error) {
    console.error("Toggle follow error:", error);
    res.status(500).json({ success: false, message: 'Server error updating follow status' });
  }
};

// @desc    Rate a mentor
export const rateMentor = async (req, res) => {
  try {
    const { score, feedback } = req.body;
    const mentor = await User.findById(req.params.id);
    if (!mentor || mentor.role !== 'mentor') return res.status(404).json({ success: false, message: 'Mentor not found' });
    if (!mentor.followers?.some((id) => id.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Follow the mentor before rating' });
    }

    const numericScore = Math.max(1, Math.min(5, Number(score)));
    const existing = mentor.ratings.find((r) => r.student?.toString() === req.user._id.toString());
    if (existing) {
      existing.score = numericScore;
      if (feedback !== undefined) existing.feedback = feedback;
    } else {
      mentor.ratings.push({ student: req.user._id, score: numericScore, feedback });
    }

    mentor.averageRating = mentor.ratings.length > 0
      ? mentor.ratings.reduce((acc, item) => item.score + acc, 0) / mentor.ratings.length
      : 0;
    await mentor.save();
    res.status(201).json({ success: true, message: 'Rating saved', data: { averageRating: mentor.averageRating } });
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
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Admin status cannot be changed here' });
    }

    const wasActive = user.isActive;
    user.isActive = !user.isActive;
    await user.save();
    res.json({
      success: true,
      message: wasActive ? 'User access revoked' : 'User approved successfully',
    });
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
