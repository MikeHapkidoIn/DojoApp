import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js'; // ✅ Importamos User
import bcrypt from 'bcryptjs'; // ✅ Para encriptar contraseña

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
    
    // ✅ VERIFICAR/CREAR USUARIO ADMIN POR DEFECTO
    await createDefaultAdmin();
    
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

// ✅ FUNCIÓN PARA CREAR ADMIN POR DEFECTO
const createDefaultAdmin = async () => {
  try {
    const adminEmail = 'admin@dojo.com';
    
    // Verificar si ya existe un admin
    const adminExists = await User.findOne({ 
      email: adminEmail,
      role: 'admin' 
    });
    
    if (!adminExists) {
      // Encriptar contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin123', salt); // Contraseña por defecto
      
      // Crear usuario admin
      const adminUser = await User.create({
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      
      console.log('👑 Usuario administrador creado:');
      console.log('   📧 Email:', adminEmail);
      console.log('   🔑 Contraseña: Admin123');
      console.log('   ⚠️  ¡Cambia esta contraseña inmediatamente!');
    } else {
      console.log('👑 Usuario administrador ya existe');
    }
    
  } catch (error) {
    console.error('❌ Error creando admin por defecto:', error.message);
  }
};

export default connectDB;