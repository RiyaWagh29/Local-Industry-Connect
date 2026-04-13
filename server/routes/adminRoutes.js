import express from 'express';
import { getAllUsers, promoteToAdmin, toggleUserStatus, getAuditLogs, exportUsersCSV, getAdminMetrics } from '../controllers/userController.js';
import { getSessionsAdmin, cancelSessionAdmin, bulkCancelSessions } from '../controllers/sessionController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes here are protected by both general auth AND adminOnly middleware
router.use(protect);
router.use(adminOnly);

// Users Management
router.get('/users', getAllUsers);
router.get('/users/export', exportUsersCSV);
router.put('/promote/:id', promoteToAdmin);
router.put('/users/:id/status', toggleUserStatus);

// Session Moderation
router.get('/sessions', getSessionsAdmin);
router.put('/sessions/:id/cancel', cancelSessionAdmin);
router.post('/sessions/bulk-cancel', bulkCancelSessions);

// Observability (Read-Only)
router.get('/logs', getAuditLogs);
router.get('/metrics', getAdminMetrics);

export default router;
