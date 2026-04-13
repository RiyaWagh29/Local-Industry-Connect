import mongoose from 'mongoose';

const idempotencySchema = mongoose.Schema(
  {
    key: {
      type: String,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    method: String,
    path: String,
    responseCode: Number,
    responseBody: mongoose.Schema.Types.Mixed,
    createdAt: {
      type: Date,
      default: Date.now,
      // Document automatically destroyed after 24 hours (86400 seconds)
      expires: 86400 
    }
  }
);

idempotencySchema.index({ key: 1, path: 1, user: 1 }, { unique: true });

const IdempotencyKey = mongoose.model('IdempotencyKey', idempotencySchema);
export default IdempotencyKey;
