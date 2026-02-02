import Student from '../models/Student.js';
import { deleteOldPhoto } from '../middleware/upload.js';


const uploadMyPhoto = async (req, res) => {
  try {
    
    const student = await Student.findOne({ user: req.user._id });
    
    if (!student) {
      return res.status(404).json({
        message: 'Estudiante no encontrado'
      });
    }

    
    if (student.foto) {
      await deleteOldPhoto(student.foto);
    }

    
    student.foto = req.file.path; 
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


const uploadStudentPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    
   
    const student = await Student.findById(id);
    
    if (!student) {
      return res.status(404).json({
        message: 'Estudiante no encontrado'
      });
    }

    
    if (student.foto) {
      await deleteOldPhoto(student.foto);
    }

    
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


const deleteMyPhoto = async (req, res) => {
  try {
    
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

    
    await deleteOldPhoto(student.foto);

    
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


const deleteStudentPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    
    
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

    
    await deleteOldPhoto(student.foto);

    
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