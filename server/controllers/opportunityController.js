

// @desc    Get all opportunities
// @route   GET /api/opportunities
// @access  Private
export const getOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find({})
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
    const { title, company, location, type, deadline, description, industry, requirements } = req.body;

    const opportunity = await Opportunity.create({
      title,
      company,
      location,
      type,
      deadline,
      description,
      industry,
      requirements,
      mentorId: req.user._id,
    });

    res.status(201).json({ success: true, data: opportunity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
