import mongoose from 'mongoose';

const auditLogSchema = mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    action: {
      type: String,
      required: true,
      enum: ['promote', 'suspend', 'activate', 'cancel_session', 'bulk_cancel'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // Optional for bulk actions
    },
    targetModel: {
      type: String,
      required: false,
      enum: ['User', 'Session'],
    },
    details: {
      type: String,
      default: '',
    },
    metadata: {
      type: Object,
      default: {},
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Prevent updates
  }
);

// Performance indices for admin feed
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actorId: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
