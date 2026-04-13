import mongoose from 'mongoose';

const sessionSchema = mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    cancelled: {
      type: Boolean,
      default: false,
    },
    meetingLink: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    cancelledBy: {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['student', 'mentor', 'admin'] }
    },
    history: [
      {
        status: { type: String },
        at: { type: Date }
      }
    ]
  },
  {
    timestamps: true,
  }
);

// Advanced Indexing for Atomic Overlap Queries & Analytics
sessionSchema.index({ mentor: 1, start: 1, end: 1 });
sessionSchema.index({ student: 1, start: 1, end: 1 });
sessionSchema.index({ mentor: 1, start: 1 });
sessionSchema.index({ mentor: 1, end: 1 });
sessionSchema.index({ status: 1 });

// Secondary Overlap Re-check (Local Fallback)
sessionSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('start') || this.isModified('end') || this.isModified('status')) {
    
    // Only check if active status
    if (['pending', 'confirmed'].includes(this.status)) {
        const overlappingSession = await this.constructor.findOne({
            _id: { $ne: this._id },
            $or: [{ mentor: this.mentor }, { student: this.student }],
            status: { $in: ['pending', 'confirmed'] },
            start: { $lt: this.end },
            end: { $gt: this.start }
        });

        if (overlappingSession) {
            return next(new Error('Transaction Failed: Target Interval is already occupied by a conflicting session.'));
        }
    }
  }
  next();
});

// History Timeline Auditing Hook
sessionSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('status')) {
    this.history.push({
      status: this.status,
      at: new Date()
    });
    
    if (this.status === 'cancelled') {
        this.cancelled = true;
    }
  }
  next();
});

const Session = mongoose.model('Session', sessionSchema);

export default Session;
