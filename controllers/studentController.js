import Student from '../models/Student.js';
import User from '../models/User.js';

// ======================
// 👤 CONTROLADORES PARA ESTUDIANTES
// ======================

/**
 * Obtener el perfil COMPLETO del estudiante actual
 * Solo el estudiante puede ver SU propio perfil
 */
const getMyProfile = async (req, res) => {
  try {
    // req.user viene del middleware protect (usuario autenticado)
    const student = await Student.findOne({ user: req.user._id })
      .populate('user', 'email role') // Trae email y role del User
      .select('-__v'); // Excluye el campo __v de Mongoose

    if (!student) {
      return res.status(404).json({ 
        message: 'Perfil de estudiante no encontrado' 
      });
    }

    res.json({
      message: '✅ Perfil obtenido correctamente',
      profile: student
    });

  } catch (error) {
    console.error('❌ Error obteniendo perfil:', error);
    res.status(500).json({ 
      message: 'Error en el servidor al obtener el perfil' 
    });
  }
};

/**
 * Actualizar el perfil del estudiante actual
 * El estudiante solo puede actualizar SUS datos básicos
 */
const updateMyProfile = async (req, res) => {
  try {
    const { 
      telefono, 
      direccion, 
      contactoEmergencia 
    } = req.body;

    // Solo permitimos que el estudiante actualice estos campos
    const allowedUpdates = {};
    
    if (telefono !== undefined) allowedUpdates.telefono = telefono;
    if (direccion !== undefined) allowedUpdates.direccion = direccion;
    if (contactoEmergencia !== undefined) allowedUpdates.contactoEmergencia = contactoEmergencia;

    // Si no hay campos válidos para actualizar
    if (Object.keys(allowedUpdates).length === 0) {
      return res.status(400).json({ 
        message: 'No se proporcionaron campos válidos para actualizar' 
      });
    }

    // ✅ CORREGIDO: Con populate para devolver datos completos
    const student = await Student.findOneAndUpdate(
      { user: req.user._id }, // Busca por el ID del usuario actual
      allowedUpdates,
      { 
        new: true, // Devuelve el documento actualizado
        runValidators: true // Ejecuta las validaciones del esquema
      }
    )
    .populate('user', 'email role') // ✅ AÑADIDO: Trae datos del User
    .select('-__v');

    if (!student) {
      return res.status(404).json({ 
        message: 'Perfil de estudiante no encontrado' 
      });
    }

    res.json({
      message: '✅ Perfil actualizado correctamente',
      profile: student
    });

  } catch (error) {
    console.error('❌ Error actualizando perfil:', error);
    
    // Manejo específico de errores de validación
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Error de validación',
        errors: messages 
      });
    }
    
    res.status(500).json({ 
      message: 'Error en el servidor al actualizar el perfil' 
    });
  }
};

// ======================
// 👑 CONTROLADORES PARA ADMINISTRADORES
// ======================

/**
 * Obtener TODOS los estudiantes (solo admin)
 */
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({})
      .populate('user', 'email role')
      .select('-__v')
      .sort({ fullName: 1 }); // Orden alfabético

    res.json({
      message: '✅ Lista de estudiantes obtenida correctamente',
      count: students.length,
      students
    });

  } catch (error) {
    console.error('❌ Error obteniendo estudiantes:', error);
    res.status(500).json({ 
      message: 'Error en el servidor al obtener estudiantes' 
    });
  }
};

/**
 * Obtener un estudiante específico por ID (solo admin)
 */
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'email role')
      .select('-__v');

    if (!student) {
      return res.status(404).json({ 
        message: 'Estudiante no encontrado' 
      });
    }

    res.json({
      message: '✅ Estudiante obtenido correctamente',
      student
    });

  } catch (error) {
    console.error('❌ Error obteniendo estudiante:', error);
    
    // Si el ID no tiene formato válido de MongoDB
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        message: 'ID de estudiante no válido' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error en el servidor al obtener el estudiante' 
    });
  }
};

/**
 * Actualizar CUALQUIER estudiante (solo admin)
 * El admin puede actualizar TODOS los campos
 */
const updateStudent = async (req, res) => {
  try {
    // Lista de campos que NO puede actualizar el admin
    const restrictedFields = ['user', '_id', 'createdAt', 'updatedAt', '__v'];
    
    // Filtrar campos restringidos
    const updates = { ...req.body };
    restrictedFields.forEach(field => delete updates[field]);

    // Si no hay campos para actualizar
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ 
        message: 'No se proporcionaron campos para actualizar' 
      });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updates,
      { 
        new: true,
        runValidators: true
      }
    )
    .populate('user', 'email role')
    .select('-__v');

    if (!student) {
      return res.status(404).json({ 
        message: 'Estudiante no encontrado' 
      });
    }

    res.json({
      message: '✅ Estudiante actualizado correctamente',
      student
    });

  } catch (error) {
    console.error('❌ Error actualizando estudiante:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Error de validación',
        errors: messages 
      });
    }
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        message: 'ID de estudiante no válido' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error en el servidor al actualizar el estudiante' 
    });
  }
};

/**
 * "Eliminar" estudiante (cambiar estado a inactivo - solo admin)
 * No eliminamos físicamente, solo cambiamos activo: false
 */
const deactivateStudent = async (req, res) => {
  try {
    // ✅ VERSIÓN COMPLETA CORREGIDA: Con populate
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    )
    .populate('user', 'email role') // ✅ AÑADIDO: Trae datos del User
    .select('-__v');

    if (!student) {
      return res.status(404).json({ 
        message: 'Estudiante no encontrado' 
      });
    }

    // También podemos desactivar el usuario asociado
    await User.findByIdAndUpdate(student.user, { active: false });

    res.json({
      message: '✅ Estudiante desactivado correctamente',
      student: {
        _id: student._id,
        fullName: student.fullName,
        email: student.user.email, // ✅ Ahora podemos acceder al email gracias al populate
        role: student.user.role,   // ✅ Y al role
        activo: student.activo,
        desactivadoEl: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error desactivando estudiante:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        message: 'ID de estudiante no válido' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error en el servidor al desactivar el estudiante' 
    });
  }
};

/**
 * Buscar estudiantes con filtros (solo admin)
 */
const searchStudents = async (req, res) => {
  try {
    const { 
      arteMarcial, 
      categoria, 
      cinturonActual,
      federado 
    } = req.query;
    
    const filter = {};
    
    // Aplicar filtros si vienen en la query
    if (arteMarcial) filter.arteMarcial = arteMarcial;
    if (categoria) filter.categoria = categoria;
    if (cinturonActual) filter.cinturonActual = cinturonActual;
    if (federado !== undefined) {
      filter['informacionFederacion.federadoActual'] = federado === 'true';
    }
    
    // Solo estudiantes activos
    filter.activo = true;
    
    const students = await Student.find(filter)
      .populate('user', 'email')
      .select('fullName arteMarcial categoria cinturonActual informacionFederacion.federadoActual')
      .sort({ fullName: 1 });

    res.json({
      message: '✅ Búsqueda completada',
      count: students.length,
      filtersApplied: Object.keys(filter).length,
      students
    });

  } catch (error) {
    console.error('❌ Error buscando estudiantes:', error);
    res.status(500).json({ 
      message: 'Error en el servidor al buscar estudiantes' 
    });
  }
};

// Exportar todos los controladores
export {
  getMyProfile,
  updateMyProfile,
  getAllStudents,
  getStudentById,
  updateStudent,
  deactivateStudent,
  searchStudents
};