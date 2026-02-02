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



router.get('/', protect, getEvents);


router.get('/upcoming', protect, getUpcomingEvents);


router.get('/today', protect, getTodayEvents);


router.get('/:id', protect, getEventById);





router.post('/', protect, admin, createEvent);


router.put('/:id', protect, admin, updateEvent);


router.delete('/:id', protect, admin, deleteEvent);

export default router;