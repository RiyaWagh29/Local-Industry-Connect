import mongoose from 'mongoose';

const opportunitySchema = mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['job', 'internship', 'workshop', 'field visit', 'industry visit'],
      required: true,
    },
    role: {
      type: String,
      default: '',
    },
    company: {
      type: String,
      required: true,
      default: '',
    },
    deadline: {
      type: String,
      default: '',
    },
    skillsRequired: {
      type: String,
      default: '',
    },
    date: {
      type: String,
      default: '',
    },
    time: {
      type: String,
      default: '',
    },
    place: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Opportunity = mongoose.model('Opportunity', opportunitySchema);

export default Opportunity;
