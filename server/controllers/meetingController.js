import Meeting from '../models/Meeting.js';

// @desc    Request a meeting
// @route   POST /api/meetings
// @access  Private (Students)
export const requestMeeting = async (req, res) => {
  try {
    const { mentor_id, date_time, notes } = req.body;
    const meeting = await Meeting.create({
      student_id: req.user._id,
      mentor_id,
      date_time,
      notes,
    });
    res.status(201).json({ success: true, data: meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get meetings for a mentor
// @route   GET /api/meetings/mentor/:id
// @access  Private
export const getMentorMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({ mentor_id: req.params.id }).populate('student_id', 'name avatar');
    res.json({ success: true, data: meetings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get meetings for a student
// @route   GET /api/meetings/student/:id
// @access  Private
export const getStudentMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({ student_id: req.params.id }).populate('mentor_id', 'name avatar');
    res.json({ success: true, data: meetings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update meeting status
// @route   PUT /api/meetings/:id
// @access  Private (Mentor)
export const updateMeetingStatus = async (req, res) => {
  try {
    const { status, date_time } = req.body;
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });
    
    meeting.status = status || meeting.status;
    if (date_time) meeting.date_time = date_time;

    await meeting.save();
    res.json({ success: true, data: meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
