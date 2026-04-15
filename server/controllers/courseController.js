import Course from '../models/Course.js';

export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({})
      .populate('mentor', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('mentor', 'name email avatar');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { name, description, pricingType, duration } = req.body;

    const course = await Course.create({
      mentor: req.user._id,
      name,
      description,
      pricingType,
      duration,
    });

    const populatedCourse = await Course.findById(course._id).populate('mentor', 'name email avatar');

    res.status(201).json({ success: true, data: populatedCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
