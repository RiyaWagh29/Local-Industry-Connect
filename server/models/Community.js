import mongoose from 'mongoose';

const communitySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a community name'],
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    mentor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Community = mongoose.model('Community', communitySchema);

export default Community;
