import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
    },
    role: {
      type: String,
      enum: ['student', 'mentor', 'admin'],
      default: 'student',
    },
    skills: {
      type: [String], // Useful for Mentors
      default: [],
    },
    interests: {
      type: [String], // Useful for Students
      default: [],
    },
    bio: {
      type: String,
      default: '',
    },
    goals: {
      type: String,
      default: '',
    },
    guidance: {
      type: String,
      default: '',
    },
    company: {
      type: String,
      default: '',
    },
    experience: {
      type: Number,
      default: 0,
    },
    industries: {
      type: [String],
      default: [],
    },
    avatar: {
      type: String,
      default: '',
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    availability: [
      {
        start: { type: Date },
        end: { type: Date },
      },
    ],
    ratings: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        score: { type: Number, required: true, min: 1, max: 5 },
        feedback: { type: String }
      }
    ],
    averageRating: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    onboarding_completed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to check password match
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
