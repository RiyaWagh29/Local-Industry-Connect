import Resource from '../models/Resource.js';

// @desc    Get all resources
// @route   GET /api/resources
// @access  Private
export const getResources = async (req, res) => {
  try {
    const resources = await Resource.find({})
      .populate('sharedBy', 'name role')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Share a resource
// @route   POST /api/resources
// @access  Private
export const shareResource = async (req, res) => {
  try {
    const { title, description, type, url, tags } = req.body;

    const resource = await Resource.create({
      title,
      description,
      type,
      url,
      tags,
      sharedBy: req.user._id,
    });

    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
