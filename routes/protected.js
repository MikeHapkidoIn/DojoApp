import express from 'express';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', protect, (req, res) => {
  res.json({
    message: '✅ Acceso a perfil autorizado',
    user: {
      _id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

router.get('/admin', protect, admin, (req, res) => {
  res.json({
    message: '✅ Acceso de administrador autorizado',
    user: {
      _id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

export default router;

 