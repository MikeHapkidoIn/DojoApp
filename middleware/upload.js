import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { v2 as cloudinaryV2 } from 'cloudinary';

// Configuración Multer con almacenamiento en memoria
const storage = multer.memoryStorage();

// Middleware Multer
const uploadSinglePhoto = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    if (allowedTypes.test(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
    }
  }
}).single('foto');

// Middleware para subir archivo a Cloudinary
const handleUpload = async (req, res, next) => {
  if (!req.file) return next(); // Si no hay archivo, pasa al siguiente middleware

  try {
    const folder = 'gym-management/students';
    const studentId = req.params.id || req.user.studentProfile || 'unknown';
    const timestamp = Date.now();
    const publicId = `student-${studentId}-${timestamp}`;

    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        overwrite: true,
        resource_type: 'image',
        transformation: [
          { width: 500, height: 500, crop: 'fill', gravity: 'face' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      },
      (error, uploaded) => {
        if (error) return next(error);
        req.file.cloudinaryUrl = uploaded.secure_url;
        req.file.cloudinaryId = uploaded.public_id;
        next();
      }
    );

    // Convertir el buffer de Multer a stream
    const streamifier = await import('streamifier');
    streamifier.createReadStream(req.file.buffer).pipe(result);

  } catch (err) {
    next(err);
  }
};

// Función para eliminar foto antigua de Cloudinary
const deleteOldPhoto = async (photoUrl) => {
  if (!photoUrl) return;

  try {
    const urlParts = photoUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex === -1) return;

    const pathParts = urlParts.slice(uploadIndex + 1);
    let publicId = pathParts.join('/').replace(/\.[^/.]+$/, ''); // Quitar extensión
    await cloudinary.uploader.destroy(publicId);
    console.log(`✅ Foto eliminada de Cloudinary: ${publicId}`);
  } catch (error) {
    console.error('❌ Error eliminando foto antigua:', error.message);
  }
};

export { uploadSinglePhoto, handleUpload, deleteOldPhoto };
