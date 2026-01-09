import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getAdminStats,
  getMartialArtsDistribution,
  getPaymentsStatus,
  getUpcomingEvents,
  getActiveAlerts,
  getRecentStudents,
  getStudentDashboard
} from '../controllers/dashboardController.js';

const router = express.Router();


router.use(protect);

// DASHBOARD ADMINISTRADOR
router.get('/admin/stats', getAdminStats);
router.get('/admin/distribution', getMartialArtsDistribution);
router.get('/admin/payments-status', getPaymentsStatus);
router.get('/admin/upcoming-events', getUpcomingEvents);
router.get('/admin/active-alerts', getActiveAlerts);
router.get('/admin/recent-students', getRecentStudents);

// DASHBOARD ESTUDIANTE
router.get('/student/:id', getStudentDashboard);

export default router;