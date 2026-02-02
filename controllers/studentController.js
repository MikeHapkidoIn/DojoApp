import Student from '../models/Student.js';
import User from '../models/User.js';



const getMyProfile = async (req, res) => {
  try {
    
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


const updateMyProfile = async (req, res) => {
  try {
    const { 
      telefono, 
      direccion, 
      contactoEmergencia 
    } = req.body;

   
    const allowedUpdates = {};
    
    if (telefono !== undefined) allowedUpdates.telefono = telefono;
    if (direccion !== undefined) allowedUpdates.direccion = direccion;
    if (contactoEmergencia !== undefined) allowedUpdates.contactoEmergencia = contactoEmergencia;

    
    if (Object.keys(allowedUpdates).length === 0) {
      return res.status(400).json({ 
        message: 'No se proporcionaron campos válidos para actualizar' 
      });
    }

    
    const student = await Student.findOneAndUpdate(
      { user: req.user._id }, 
      allowedUpdates,
      { 
        new: true,
        runValidators: true 
      }
    )
    .populate('user', 'email role') 
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


const updateStudent = async (req, res) => {
  try {
   
    const restrictedFields = ['user', '_id', 'createdAt', 'updatedAt', '__v'];
    
    
    const updates = { ...req.body };
    restrictedFields.forEach(field => delete updates[field]);

   
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


const deactivateStudent = async (req, res) => {
  try {
    
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    )
    .populate('user', 'email role') 
    .select('-__v');

    if (!student) {
      return res.status(404).json({ 
        message: 'Estudiante no encontrado' 
      });
    }

    
    await User.findByIdAndUpdate(student.user, { active: false });

    res.json({
      message: '✅ Estudiante desactivado correctamente',
      student: {
        _id: student._id,
        fullName: student.fullName,
        email: student.user.email, 
        role: student.user.role,   
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


const searchStudents = async (req, res) => {
  try {
    const { 
      arteMarcial, 
      categoria, 
      cinturonActual,
      federado 
    } = req.query;
    
    const filter = {};
    
    
    if (arteMarcial) filter.arteMarcial = arteMarcial;
    if (categoria) filter.categoria = categoria;
    if (cinturonActual) filter.cinturonActual = cinturonActual;
    if (federado !== undefined) {
      filter['informacionFederacion.federadoActual'] = federado === 'true';
    }
    
   
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


export {
  getMyProfile,
  updateMyProfile,
  getAllStudents,
  getStudentById,
  updateStudent,
  deactivateStudent,
  searchStudents
};