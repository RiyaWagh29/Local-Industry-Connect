import Session from '../models/Session.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import NotificationService from '../services/NotificationService.js';
import AuditLog from '../models/AuditLog.js';
import IdempotencyKey from '../models/IdempotencyKey.js';
import MetricsService from '../services/MetricsService.js';
import { createZoomMeeting } from '../services/ZoomService.js';

const ALLOWED_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
};

// @desc    Book a new session
// @route   POST /api/sessions/book
// @access  Private (Student)
export const bookSession = async (req, res) => {
  const dbSession = await mongoose.startSession();
  
  try {
    // Attempt transaction start (Will fail automatically on Standalone Local Mongo, shifting to fallback try-catch)
    dbSession.startTransaction();

    const { mentorId, start, end } = req.body;
    console.log(`[Booking Attempt] Student ${req.user._id} requesting Mentor ${mentorId}`);

    const reqStart = new Date(start);
    const reqEnd = new Date(end);

    if (reqStart >= reqEnd) {
      console.warn(`[Validation Failed] Start time >= End time`);
      return res.status(400).json({ success: false, message: 'End time must be strictly after start time' });
    }

    // Atomic Queries within transaction
    const mentor = await User.findById(mentorId).session(dbSession);
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ success: false, message: 'Mentor not found' });
    }

    let isAvailable = false;
    for (let slot of mentor.availability) {
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);
      if (reqStart >= slotStart && reqEnd <= slotEnd) {
        isAvailable = true;
        break;
      }
    }

    if (!isAvailable) {
      return res.status(400).json({ success: false, message: 'Selected interval is outside mentor availability' });
    }

    // Global Overlap Rule Re-Check inside transaction scope
    const overlappingSession = await Session.findOne({
      $or: [{ mentor: mentorId }, { student: req.user._id }],
      status: { $in: ['pending', 'confirmed'] },
      start: { $lt: reqEnd },
      end: { $gt: reqStart }
    }).session(dbSession);

    if (overlappingSession) {
      return res.status(400).json({ success: false, message: 'Time overlap detected. You or the mentor are already booked.' });
    }

    const [sessionData] = await Session.create([{
      student: req.user._id,
      mentor: mentorId,
      start: reqStart,
      end: reqEnd,
      status: 'pending'
    }], { session: dbSession });

    // Commit Transaction (If Atlas Replica Set) with robust retry logic for transient conflicts
    for (let i = 0; i < 3; i++) {
        try {
            await dbSession.commitTransaction();
            break;
        } catch (txnErr) {
            if (txnErr.hasErrorLabel && txnErr.hasErrorLabel('TransientTransactionError') && i < 2) {
                console.warn(`[Transaction Retry] Caught transient conflict. Retrying commit... Attempt ${i+1}`);
                continue;
            }
            if (i === 2) throw new Error("Transaction failed after 3 retries");
            throw txnErr;
        }
    }

    NotificationService.emit('sessionBooked', sessionData);

    res.status(201).json({ success: true, message: 'Session booked successfully', data: sessionData });

  } catch (error) {
    if (dbSession.inTransaction()) {
        await dbSession.abortTransaction();
    }
    
    // Check if error is ReplicaSet related
    if (error.message.includes('Transaction numbers are only allowed on a replica set member') || error.message.includes('Standalone')) {
      console.warn('[Transaction Dropped] Local Standalone MongoDB detected. Relying solely on schema pre-save Hook.');
      return res.status(500).json({ success: false, message: 'Use Atlas to support atomic bookings, or rely on pre-save hook!'});
    }

    res.status(500).json({ success: false, message: error.message });
  } finally {
    dbSession.endSession();
  }
};

// @desc    Get user's sessions (Student or Mentor)
// @route   GET /api/sessions
// @access  Private
export const getSessions = async (req, res) => {
  try {
    let sessions;
    if (req.user.role === 'mentor') {
        sessions = await Session.find({ mentor: req.user._id }).populate('student', 'name email');
    } else {
        sessions = await Session.find({ student: req.user._id }).populate('mentor', 'name email skills');
    }
    
    res.json({ success: true, message: 'Sessions retrieved', data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update session status (confirm/complete/cancel)
// @route   PUT /api/sessions/:id
// @access  Private
export const updateSessionStatus = async (req, res) => {
  try {
    const { status, meetingLink, notes } = req.body;
    const session = await Session.findById(req.params.id).populate('student mentor');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // RBAC Tightening (Global Ownership Verification)
    if (req.user._id.toString() !== session.student.toString() && req.user._id.toString() !== session.mentor.toString()) {
        return res.status(401).json({ success: false, message: 'Not authorized to manipulate this session' });
    }

    if (status) {
      // 5. State Machine Guard (Non-negotiable validation)
      if (!ALLOWED_TRANSITIONS[session.status].includes(status)) {
        console.warn(`[Illegal Status Transition] Attempted ${session.status} -> ${status}`);
        return res.status(400).json({ success: false, message: `Invalid status transition from ${session.status} to ${status}` });
      }

      // Action validation based on role
      // Only mentors can confirm or complete. Both can cancel.
      if ((status === 'confirmed' || status === 'completed') && req.user.role !== 'mentor') {
        return res.status(403).json({ success: false, message: `Only mentors can change status to ${status}` });
      }

      // Real Zoom Meeting Generation
      if (status === 'confirmed' && !session.meetingLink) {
        try {
          console.log(`[Zoom Integration] Generating real meeting link for session ${session._id}`);
          session.meetingLink = await createZoomMeeting(session, session.mentor, session.student);
        } catch (zoomError) {
          console.error(`[Zoom Integration] Failed: ${zoomError.message}`);
          return res.status(500).json({ 
            success: false, 
            message: zoomError.message || 'Zoom API integration failed. Please check your credentials or try again later.' 
          });
        }
      }

      session.status = status;

      // Track cancellation origin
      if (status === 'cancelled') {
          session.cancelledBy = {
              user: req.user._id,
              role: req.user.role
          };
      }
    }

    if (meetingLink && req.user.role === 'mentor') session.meetingLink = meetingLink; 
    if (notes) session.notes = notes;

    const updatedSession = await session.save(); // Note: Pre-save hook natively tracks history
    
    if (status === 'confirmed') NotificationService.emit('sessionConfirmed', updatedSession);
    if (status === 'cancelled') NotificationService.emit('sessionCancelled', updatedSession);
    
    res.json({ success: true, message: 'Session updated', data: updatedSession });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get live slot availability for a mentor
// @route   GET /api/sessions/available
// @access  Public or Private
export const getAvailableSlots = async (req, res) => {
  try {
    const { mentorId, from, to } = req.query;

    if (!mentorId) {
      return res.status(400).json({ success: false, message: 'mentorId query parameter is required' });
    }

    const mentor = await User.findById(mentorId).select('availability name');
    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor not found' });
    }

    // Base query only touches Future bookings natively
    const query = {
      mentor: mentorId,
      status: { $in: ['pending', 'confirmed'] },
      start: { $gte: new Date() } 
    };
    
    // Apply optional boundary windows
    if (from || to) {
      query.start = { ...query.start }; 
      if (from) query.start.$gte = new Date(from);
      if (to) query.end = { $lte: new Date(to) };
    }

    const activeSessions = await Session.find(query).select('start end -_id').sort({ start: 1 });

    // Return the overarching availability blocks mapping against explicitly occupied reservations
    res.json({
      success: true,
      message: 'Live slot availability fetched.',
      data: {
        mentorName: mentor.name,
        availableWindows: mentor.availability,
        occupiedIntervals: activeSessions
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all sessions (Admin)
// @route   GET /api/admin/sessions
// @access  Private (Admin)
export const getSessionsAdmin = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const sessions = await Session.find({})
      .select('-__v')
      .populate('student', 'name email')
      .populate('mentor', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Session.countDocuments();

    res.json({ 
      success: true, 
      message: 'All sessions retrieved', 
      data: sessions,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel session (Admin)
// @route   PUT /api/admin/sessions/:id/cancel
// @access  Private (Admin)
export const cancelSessionAdmin = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Session is already cancelled' });
    }

    session.status = 'cancelled';
    session.cancelledBy = {
        user: req.user._id,
        role: req.user.role
    };
    await session.save();

    // Audit Logging
    await AuditLog.create({
      actorId: req.user._id,
      action: 'cancel_session',
      targetId: session._id,
      targetModel: 'Session',
      details: `Admin cancelled session between ${session.student} and ${session.mentor}`
    });

    MetricsService.increment('admin_session_cancellations');

    NotificationService.emit('sessionCancelled', session);

    res.json({ success: true, message: 'Session cancelled by admin', data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk cancel sessions
// @route   POST /api/admin/sessions/bulk-cancel
// @access  Private (Admin)
export const bulkCancelSessions = async (req, res) => {
  try {
    const { sessionIds } = req.body;
    const idempotencyKey = req.headers['idempotency-key'];

    if (!Array.isArray(sessionIds) || sessionIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Valid array of sessionIds is required' });
    }

    // 1. Idempotency Guard
    if (idempotencyKey) {
        const existingKey = await IdempotencyKey.findOne({ key: idempotencyKey, user: req.user._id });
        if (existingKey) {
            console.log(`[Idempotency] Replaying bulk cancel for key: ${idempotencyKey}`);
            return res.status(existingKey.responseCode).json(existingKey.responseBody);
        }
    }

    const result = await Session.updateMany(
      { _id: { $in: sessionIds }, status: { $nin: ['cancelled', 'completed'] } },
      { 
          $set: { 
              status: 'cancelled',
              cancelledBy: {
                  user: req.user._id,
                  role: req.user.role
              }
          } 
      }
    );

    // Trigger notifications asynchronously
    setImmediate(async () => {
      const affectedSessions = await Session.find({ _id: { $in: sessionIds } });
      affectedSessions.forEach(session => {
        NotificationService.emit('sessionCancelled', session);
      });
    });

    // Consolidated Audit Logging
    await AuditLog.create({
      actorId: req.user._id,
      action: 'bulk_cancel',
      details: `Bulk cancelled ${result.modifiedCount} sessions`,
      metadata: { count: result.modifiedCount, ids: sessionIds, origin: req.user.role }
    });

    MetricsService.increment('admin_bulk_cancellations');

    const responseData = { 
        success: true, 
        message: `Successfully cancelled ${result.modifiedCount} sessions`,
        data: { count: result.modifiedCount }
    };

    // Save Idempotency Key
    if (idempotencyKey) {
        await IdempotencyKey.create({
            key: idempotencyKey,
            user: req.user._id,
            path: req.originalUrl,
            responseCode: 200,
            responseBody: responseData
        });
    }

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
