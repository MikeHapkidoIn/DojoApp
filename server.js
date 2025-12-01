import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import protectedRoutes from './routes/protected.js';
import studentRoutes from './routes/students.js'
import paymentRoutes from './routes/payments.js';
import eventRoutes from './routes/events.js';

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares en ORDEN CORRECTO
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());           
app.use(express.urlencoded({extended: true})); 

// ✅ RUTAS - DESPUÉS de los parsers
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);  
app.use('/api/students', studentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/events', eventRoutes);

// Ruta de prueba
app.get('/api/test', (req,res)=>{
  res.json ({message: 'Backend del gimnasio funcionando'});
});

// Manejo de errores
app.use((err,req,res,next)=> {
  console.error(err.stack);
  res.status(500).json({message:' Algo salió mal en el servidor'});
})

// Ruta 404
app.use((req, res) => {
  res.status(404).json({message: 'Ruta no encontrada'});
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📱 Frontend: ${process.env.FRONTEND_URL}`);
  console.log(`🗄️  MongoDB URI: ${process.env.MONGODB_URI ? '✅ Configurada' : '❌ No configurada'}`);
});