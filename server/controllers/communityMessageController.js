import CommunityMessage from '../models/CommunityMessage.js';

// @desc    Get messages for a community
// @route   GET /api/community-messages/:communityId
// @access  Private
export const getCommunityMessages = async (req, res) => {
  try {
    const { communityId } = req.params;
    const messages = await CommunityMessage.find({ community_id: communityId })
      .sort({ createdAt: 1 })
      .populate('sender_id', 'name avatar role');
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a message in a community
// @route   POST /api/community-messages/:communityId
// @access  Private
export const sendCommunityMessage = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    const message = await CommunityMessage.create({
      community_id: communityId,
      sender_id: req.user._id,
      text: text.trim(),
    });

    const populated = await CommunityMessage.findById(message._id)
      .populate('sender_id', 'name avatar role');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
