import User from '../models/User.js';
import Student from '../models/Student.js'; // ✅ Asegúrate de importar Student
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';


const registerUser = async (req, res) => {
  try {
    
    const { 
      email, 
      password, 
      fullName, 
      telefono,
      fechaNacimiento,
      arteMarcial,
      direccion,
      contactoEmergencia
    } = req.body;

    // 1. Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // 2. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Crear el usuario
    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'student'
    });

    // 4. ✅ CREAR EL PERFIL DE STUDENT CON LOS NUEVOS CAMPOS
    const student = await Student.create({
      user: user._id, // Relación con User
      
      // 📋 DATOS BÁSICOS (del formulario de registro)
      fullName: fullName || 'Nombre por completar',
      telefono: telefono || 'Sin teléfono',
      fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : new Date('2000-01-01'),
      direccion: direccion || 'Dirección por completar',
      contactoEmergencia: contactoEmergencia || 'Contacto por completar',
      
      // 🥋 DATOS DE ARTES MARCIALES (valores por defecto)
      arteMarcial: arteMarcial || 'taekwondo',
      categoria: 'adulto', // Se calculará automáticamente después por fecha de nacimiento
      
      // 🥋 SISTEMA DE GRADOS (valores por defecto)
      cinturonActual: 'blanco', // Todos empiezan en blanco
      fechaProximoExamen: null, // Sin examen programado inicialmente
      historialCinturones: [], // Historial vacío al inicio
      
      // 🏛️ SISTEMA DE FEDERACIÓN (valores por defecto)
      informacionFederacion: {
        nombreFederacion: '', // Sin federación inicialmente
        numeroLicencia: '', // Sin licencia inicialmente
        fechaVencimientoLicencia: null,
        tipoLicencia: 'competencia',
        federadoActual: false, // No federado al registrarse
        fechaFederacion: null,
        historialFederaciones: []
      },
      
      // 🏆 LOGROS (vacío inicialmente)
      logros: [],
      
      // 📸 FOTO (vacía inicialmente)
      foto: '',
      
      // 📅 FECHA DE REGISTRO (automática)
      fechaRegistro: new Date(),
      
      // ✅ ESTADO
      activo: true
    });

    // 5. ✅ ACTUALIZAR EL USER CON LA REFERENCIA AL STUDENT
    user.studentProfile = student._id;
    await user.save();

    // 6. ✅ RESPUESTA MEJORADA CON MÁS INFORMACIÓN
    const userWithStudent = await User.findById(user._id)
      .populate('studentProfile', 'fullName cinturonActual arteMarcial');

    res.status(201).json({
      message: '✅ Registro exitoso',
      user: {
        _id: userWithStudent._id,
        email: userWithStudent.email,
        role: userWithStudent.role,
        token: generateToken(userWithStudent._id)
      },
      studentProfile: {
        _id: student._id,
        fullName: student.fullName,
        arteMarcial: student.arteMarcial,
        cinturonActual: student.cinturonActual,
        federado: student.informacionFederacion.federadoActual
      }
    });
    
  } catch (error) {
    console.error('❌ Error en registro:', error);
    
    // ✅ MANEJO DE ERRORES MEJORADO
    // Si falla la creación del Student, eliminamos el User para evitar inconsistencias
    if (req.user) {
      await User.findByIdAndDelete(req.user._id);
    }
    
    // Mensajes de error más específicos
    if (error.code === 11000) {
      // Error de duplicado (email o número de licencia)
      return res.status(400).json({ 
        message: 'El email o número de licencia ya está en uso' 
      });
    }
    
    if (error.name === 'ValidationError') {
      // Error de validación de Mongoose
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Error de validación',
        errors: messages 
      });
    }
    
    res.status(500).json({ 
      message: 'Error en el servidor al procesar el registro',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Controlador para login de usuarios (se mantiene igual)
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export { registerUser, loginUser };