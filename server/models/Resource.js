import mongoose from 'mongoose';

const localizedStringSchema = {
  en: { type: String, required: true },
  mr: { type: String, required: true },
};

const resourceSchema = mongoose.Schema(
  {
    title: localizedStringSchema,
    description: localizedStringSchema,
    type: {
      type: String,
      enum: ['pdf', 'link', 'video', 'document'],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    storagePath: {
      type: String,
      default: '',
    },
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    community_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      default: null,
    },
    sharedDate: {
      type: Date,
      default: Date.now,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;
