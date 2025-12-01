import Student from '../models/Student.js';
import { deleteOldPhoto } from '../middleware/upload.js';

// ======================
// 🖼️ CONTROLADORES PARA SUBIR FOTOS
// ======================

/**
 * Subir/actualizar foto del estudiante actual
 */
const uploadMyPhoto = async (req, res) => {
  try {
    // Buscar el estudiante asociado a este usuario
    const student = await Student.findOne({ user: req.user._id });
    
    if (!student) {
      return res.status(404).json({
        message: 'Estudiante no encontrado'
      });
    }

    // Si ya tenía una foto, eliminarla de Cloudinary
    if (student.foto) {
      await deleteOldPhoto(student.foto);
    }

    // Actualizar la URL de la foto en la base de datos
    student.foto = req.file.path; // Cloudinary devuelve la URL en req.file.path
    await student.save();

    res.json({
      message: '✅ Foto actualizada correctamente',
      foto: student.foto,
      student: {
        _id: student._id,
        fullName: student.fullName,
        foto: student.foto
      }
    });

  } catch (error) {
    console.error('❌ Error subiendo foto:', error);
    
    // Si hay error, intentar eliminar la foto subida a Cloudinary
    if (req.file && req.file.path) {
      try {
        await deleteOldPhoto(req.file.path);
      } catch (deleteError) {
        console.error('Error eliminando foto fallida:', deleteError);
      }
    }
    
    res.status(500).json({
      message: 'Error en el servidor al subir la foto'
    });
  }
};

/**
 * Subir/actualizar foto de cualquier estudiante (solo admin)
 */
const uploadStudentPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar el estudiante
    const student = await Student.findById(id);
    
    if (!student) {
      return res.status(404).json({
        message: 'Estudiante no encontrado'
      });
    }

    // Si ya tenía una foto, eliminarla de Cloudinary
    if (student.foto) {
      await deleteOldPhoto(student.foto);
    }

    // Actualizar la URL de la foto
    student.foto = req.file.path;
    await student.save();

    res.json({
      message: `✅ Foto de ${student.fullName} actualizada correctamente`,
      foto: student.foto,
      student: {
        _id: student._id,
        fullName: student.fullName,
        foto: student.foto
      }
    });

  } catch (error) {
    console.error('❌ Error subiendo foto de estudiante:', error);
    
    // Cleanup en caso de error
    if (req.file && req.file.path) {
      try {
        await deleteOldPhoto(req.file.path);
      } catch (deleteError) {
        console.error('Error eliminando foto fallida:', deleteError);
      }
    }
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        message: 'ID de estudiante no válido'
      });
    }
    
    res.status(500).json({
      message: 'Error en el servidor al subir la foto'
    });
  }
};

/**
 * Eliminar foto del estudiante actual
 */
const deleteMyPhoto = async (req, res) => {
  try {
    // Buscar el estudiante asociado a este usuario
    const student = await Student.findOne({ user: req.user._id });
    
    if (!student) {
      return res.status(404).json({
        message: 'Estudiante no encontrado'
      });
    }

    if (!student.foto) {
      return res.status(400).json({
        message: 'No tienes ninguna foto para eliminar'
      });
    }

    // Eliminar la foto de Cloudinary
    await deleteOldPhoto(student.foto);

    // Actualizar el campo foto en la base de datos
    student.foto = '';
    await student.save();

    res.json({
      message: '✅ Foto eliminada correctamente',
      student: {
        _id: student._id,
        fullName: student.fullName,
        foto: student.foto
      }
    });

  } catch (error) {
    console.error('❌ Error eliminando foto:', error);
    res.status(500).json({
      message: 'Error en el servidor al eliminar la foto'
    });
  }
};

/**
 * Eliminar foto de cualquier estudiante (solo admin)
 */
const deleteStudentPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar el estudiante
    const student = await Student.findById(id);
    
    if (!student) {
      return res.status(404).json({
        message: 'Estudiante no encontrado'
      });
    }

    if (!student.foto) {
      return res.status(400).json({
        message: 'El estudiante no tiene ninguna foto para eliminar'
      });
    }

    // Eliminar la foto de Cloudinary
    await deleteOldPhoto(student.foto);

    // Actualizar el campo foto
    student.foto = '';
    await student.save();

    res.json({
      message: `✅ Foto de ${student.fullName} eliminada correctamente`,
      student: {
        _id: student._id,
        fullName: student.fullName,
        foto: student.foto
      }
    });

  } catch (error) {
    console.error('❌ Error eliminando foto de estudiante:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        message: 'ID de estudiante no válido'
      });
    }
    
    res.status(500).json({
      message: 'Error en el servidor al eliminar la foto'
    });
  }
};

export {
  uploadMyPhoto,
  uploadStudentPhoto,
  deleteMyPhoto,
  deleteStudentPhoto
};