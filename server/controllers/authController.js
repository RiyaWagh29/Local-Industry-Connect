import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT Token
const generateToken = (id) => {
  console.log("JWT_SECRET:", process.env.JWT_SECRET);
  
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not defined in environment");
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
    issuer: 'smcp',
    audience: 'smcp-web'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, skills, interests, bio, availability } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      skills: skills || [],
      interests: interests || [],
      bio: bio || '',
      availability: availability || []
    });

    if (user) {
      // REGISTER
res.status(201).json({
  success: true,
  token: generateToken(user._id),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    onboarding_completed: user.onboarding_completed || false,
  },
});
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // LOGIN
res.json({
  success: true,
  token: generateToken(user._id),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    onboarding_completed: user.onboarding_completed || false,
  },
});
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Refresh Token Logic (Stubbed UX implementation)
// @route   POST /api/auth/refresh
// @access  Public (Expects existing valid or cleanly expired token)
export const refreshToken = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'Refresh endpoint stubbed. Return standard JWT payloads here later!' });
  } catch(error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
