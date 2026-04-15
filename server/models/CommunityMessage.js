import mongoose from 'mongoose';

const communityMessageSchema = mongoose.Schema(
  {
    community_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

const CommunityMessage = mongoose.model('CommunityMessage', communityMessageSchema);

export default CommunityMessage;
