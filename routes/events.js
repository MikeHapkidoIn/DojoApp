import express from 'express';
import {
  createEvent,
  getEvents,
  getUpcomingEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getTodayEvents
} from '../controllers/eventController.js';

import { protect, admin } from '../middleware/auth.js';

const router = express.Router();


// RUTAS PARA EVENTOS


/**
 * GET /api/events
 * Obtener todos los eventos (con filtros)
 * Admin: ve todos
 * Estudiante: solo visibles
 */
router.get('/', protect, getEvents);

/**
 * GET /api/events/upcoming
 * Obtener eventos próximos (para calendario)
 */
router.get('/upcoming', protect, getUpcomingEvents);

/**
 * GET /api/events/today
 * Obtener eventos del día actual
 */
router.get('/today', protect, getTodayEvents);

/**
 * GET /api/events/:id
 * Obtener un evento específico
 */
router.get('/:id', protect, getEventById);


// RUTAS SOLO PARA ADMINISTRADORES


/**
 * POST /api/events
 * Crear nuevo evento
 */
router.post('/', protect, admin, createEvent);

/**
 * PUT /api/events/:id
 * Actualizar evento
 */
router.put('/:id', protect, admin, updateEvent);

/**
 * DELETE /api/events/:id
 * Eliminar evento
 */
router.delete('/:id', protect, admin, deleteEvent);

export default router;