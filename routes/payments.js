import express from 'express';
import { 
  createPayment,
  getStudentPayments,
  markAsPaid,
  getPaymentAlerts,
  getMonthlyReport,
  getMyPayments
} from '../controllers/paymentController.js';

import { protect, admin } from '../middleware/auth.js';

const router = express.Router();






router.post('/', protect, admin, createPayment);


router.get('/alerts', protect, admin, getPaymentAlerts);


router.get('/report', protect, admin, getMonthlyReport);


router.put('/:paymentId/paid', protect, admin, markAsPaid);


router.get('/me', protect, getMyPayments);


router.get('/student/:studentId', protect, getStudentPayments);

export default router;