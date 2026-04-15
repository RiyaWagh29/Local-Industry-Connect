import Community from '../models/Community.js';

// @desc    Create a community
// @route   POST /api/communities
// @access  Private (Mentors)
export const createCommunity = async (req, res) => {
  try {
    const { name, description } = req.body;
    const community = await Community.create({
      name,
      description,
      mentor_id: req.user._id,
      members: [req.user._id],
    });
    console.log("Creating community:", req.body);
    console.log("User:", req.user);
    res.status(201).json({ success: true, data: community });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get communities for a specific mentor
// @route   GET /api/communities/mentor/:mentorId
// @access  Private
export const getMentorCommunities = async (req, res) => {
  try {
    const communities = await Community.find({ mentor_id: req.params.mentorId })
      .populate('members', 'name avatar role createdAt');
    res.json({ success: true, data: communities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all communities (for students)
// @route   GET /api/communities
// @access  Private
export const getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find({}).populate('mentor_id', 'name avatar');
    res.json({ success: true, data: communities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Join a community
// @route   POST /api/communities/:id/join
// @access  Private
export const joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });
    
    if (community.members.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Already a member' });
    }

    community.members.push(req.user._id);
    await community.save();
    res.json({ success: true, message: 'Joined successfully', membersCount: community.members.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
