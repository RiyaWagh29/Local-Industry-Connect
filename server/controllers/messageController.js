import Message from '../models/Message.js';

// @desc    Get all conversations for the current user
// @route   GET /api/messages
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find all unique participants the user has messaged
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }]
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'name avatar role')
    .populate('recipient', 'name avatar role');

    const convMap = new Map();

    messages.forEach(msg => {
      const otherUser = msg.sender._id.toString() === userId.toString() ? msg.recipient : msg.sender;
      if (!otherUser) return;
      const otherUserId = otherUser._id.toString();

      if (!convMap.has(otherUserId)) {
        convMap.set(otherUserId, {
          id: otherUserId,
          participantName: otherUser.name,
          participantAvatar: otherUser.avatar,
          participantRole: otherUser.role,
          lastMessage: msg.text,
          lastTime: msg.createdAt,
          messages: [] 
        });
      }
    });

    res.json({ success: true, data: Array.from(convMap.values()) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get conversation between two users
// @route   GET /api/messages/:otherUserId
// @access  Private
export const getConversation = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: otherUserId },
        { sender: otherUserId, recipient: req.user._id }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'name avatar')
    .populate('recipient', 'name avatar');
    
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { recipientId, text, attachments } = req.body;

    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      text,
      attachments
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('recipient', 'name avatar');

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
