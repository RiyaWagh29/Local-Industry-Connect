import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config/env.js';
import { uploadBufferToSupabase } from '../services/storageService.js';

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin123';

// Generate JWT Token
const generateToken = (id) => {
  console.log("JWT_SECRET:", process.env.JWT_SECRET);
  
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not defined in environment");
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
    issuer: 'smcp',
    audience: 'smcp-web'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, skills, interests, bio, availability, linkedinProfile } = req.body;

    if (role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admin account creation is disabled' });
    }

    if (role === 'mentor') {
      if (!String(linkedinProfile || '').trim()) {
        return res.status(400).json({ success: false, message: 'LinkedIn profile link is required for mentors' });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Office ID card photo is required for mentors' });
      }
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      isActive: false,
      skills: skills || [],
      interests: interests || [],
      bio: bio || '',
      availability: availability || [],
      linkedinProfile: role === 'mentor' ? String(linkedinProfile || '').trim() : '',
      officeIdCardUrl: '',
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          onboarding_completed: user.onboarding_completed || false,
        },
      });

      if (role === 'mentor' && req.file) {
        uploadBufferToSupabase({
          bucket: config.verificationBucket,
          file: req.file,
          folder: 'office-id-cards',
        })
          .then(async (uploadedOfficeId) => {
            await User.findByIdAndUpdate(user._id, {
              officeIdCardUrl: uploadedOfficeId?.publicUrl || '',
            });
          })
          .catch((uploadError) => {
            console.error('Office ID card upload failed after mentor signup:', uploadError);
          });
      }
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
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (normalizedEmail === ADMIN_EMAIL) {
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      let adminUser = await User.findOne({ email: ADMIN_EMAIL });
      if (!adminUser) {
        adminUser = await User.create({
          name: 'Admin',
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          role: 'admin',
          skills: [],
          interests: [],
          bio: '',
          availability: [],
          onboarding_completed: true,
        });
      } else if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        adminUser.onboarding_completed = true;
        await adminUser.save();
      }

      return res.json({
        success: true,
        token: generateToken(adminUser._id),
        user: {
          id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
          isActive: adminUser.isActive,
          onboarding_completed: true,
        },
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

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
    isActive: user.isActive,
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
