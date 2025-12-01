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

// ======================
// 👑 RUTAS PARA ADMINISTRADORES
// ======================

/**
 * POST /api/payments
 * Crear nuevo pago (solo admin)
 */
router.post('/', protect, admin, createPayment);

/**
 * GET /api/payments/alerts
 * Obtener alertas de pagos impagos (para el aside)
 */
router.get('/alerts', protect, admin, getPaymentAlerts);

/**
 * GET /api/payments/report
 * Obtener reporte mensual (solo admin)
 */
router.get('/report', protect, admin, getMonthlyReport);

/**
 * PUT /api/payments/:paymentId/paid
 * Marcar pago como realizado (solo admin)
 */
router.put('/:paymentId/paid', protect, admin, markAsPaid);

// ======================
// 📱 RUTAS PARA ESTUDIANTES
// ======================

/**
 * GET /api/payments/me
 * Obtener mis propios pagos
 */
router.get('/me', protect, getMyPayments);

// ======================
// 🔍 RUTAS MIXTAS (admin ve cualquiera, estudiante ve solo lo suyo)
// ======================

/**
 * GET /api/payments/student/:studentId
 * Obtener pagos de un estudiante específico
 */
router.get('/student/:studentId', protect, getStudentPayments);

export default router;