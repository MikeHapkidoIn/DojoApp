import jwt from 'jsonwebtoken';
import User from '../models/User.js'; 


const protect = async (req, res, next) => { // ✅ CORREGIDO - 'res', no 'resizeBy'
  try {
    let token;

    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      
      token = req.headers.authorization.split(' ')[1];
    }

   
    if (!token) {
      return res.status(401).json({ message: 'No autorizado, token faltante' });
    }

    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'No autorizado, usuario no encontrado' });
    }

    
    req.user = user;
    next();

  } catch (error) {
    console.error('Error en autenticación:', error);

    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'No autorizado, token inválido' });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'No autorizado, token expirado' });
    }

    
    return res.status(401).json({ message: 'No autorizado, token inválido' });
  }
};

// Middleware para administradores
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      message: 'Acceso denegado, se requieren privilegios de administrador' 
    });
  }
};

export { protect, admin };
