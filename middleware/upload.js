import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// ✅ CONFIGURACIÓN DE CLOUDINARY PARA MULTER
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gym-management/students', // Carpeta en Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 500, height: 500, crop: 'fill', gravity: 'face' }, // Redimensionar y recortar
      { quality: 'auto:good' }, // Calidad automática buena
      { fetch_format: 'auto' } // Formato automático
    ],
    public_id: (req, file) => {
      // Nombre único: estudiante-id-timestamp
      const studentId = req.params.id || req.user.studentProfile || 'unknown';
      const timestamp = Date.now();
      return `student-${studentId}-${timestamp}`;
    }
  }
});

// ✅ FILTRO DE ARCHIVOS - Solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(file.mimetype.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
  }
};

// ✅ CONFIGURACIÓN DE MULTER
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 1 // Solo un archivo
  },
  fileFilter: fileFilter
});

// ✅ MIDDLEWARE PARA SUBIR UNA SOLA FOTO
const uploadSinglePhoto = upload.single('foto');

// ✅ MANEJADOR DE ERRORES PARA MULTER
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Errores específicos de Multer
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'La imagen es demasiado grande. Máximo 5MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Solo se permite subir una imagen a la vez'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Campo de archivo incorrecto. Use "foto" como nombre'
      });
    }
  } else if (err) {
    // Otros errores
    return res.status(400).json({
      message: err.message || 'Error al subir la imagen'
    });
  }
  next();
};

// ✅ MIDDLEWARE PARA VALIDAR QUE SE SUBIÓ UNA IMAGEN
const validatePhotoUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      message: 'Por favor, selecciona una imagen para subir'
    });
  }
  next();
};

// ✅ FUNCIÓN PARA ELIMINAR FOTO ANTIGUA DE CLOUDINARY
const deleteOldPhoto = async (photoUrl) => {
  try {
    if (!photoUrl) return;
    
    // Extraer el public_id de la URL de Cloudinary
    // Formato: https://res.cloudinary.com/cloudname/image/upload/v1234567/folder/filename.jpg
    const urlParts = photoUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex !== -1) {
      // Tomar todo después de 'upload/'
      const pathParts = urlParts.slice(uploadIndex + 1);
      let publicId = pathParts.join('/');
      
      // Remover extensión del archivo
      publicId = publicId.replace(/\.[^/.]+$/, '');
      
      // Eliminar la imagen de Cloudinary
      await cloudinary.uploader.destroy(publicId);
      console.log(`✅ Foto eliminada de Cloudinary: ${publicId}`);
    }
  } catch (error) {
    console.error('❌ Error eliminando foto antigua:', error.message);
    // No lanzamos error para no interrumpir el flujo principal
  }
};

export {
  uploadSinglePhoto,
  handleUploadErrors,
  validatePhotoUpload,
  deleteOldPhoto
};