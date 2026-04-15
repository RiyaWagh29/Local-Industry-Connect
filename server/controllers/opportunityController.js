import Opportunity from '../models/Opportunity.js';

// @desc    Get all opportunities
// @route   GET /api/opportunities
// @access  Private
export const getOpportunities = async (req, res) => {
  try {
    const filter = req.query.communityId ? { communityId: req.query.communityId } : {};

    const opportunities = await Opportunity.find(filter)
      .populate('communityId', 'name mentor_id')
      .populate('mentorId', 'name')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: opportunities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create an opportunity
// @route   POST /api/opportunities
// @access  Private (Mentor)
export const createOpportunity = async (req, res) => {
  try {
    const {
      communityId,
      type,
      role,
      company,
      deadline,
      skillsRequired,
      date,
      time,
      place,
    } = req.body;

    const opportunity = await Opportunity.create({
      communityId,
      type,
      role: role || '',
      company,
      deadline: deadline || '',
      skillsRequired: skillsRequired || '',
      date: date || '',
      time: time || '',
      place: place || '',
      mentorId: req.user._id,
    });

    const populatedOpportunity = await Opportunity.findById(opportunity._id)
      .populate('communityId', 'name mentor_id')
      .populate('mentorId', 'name');

    res.status(201).json({ success: true, data: populatedOpportunity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
