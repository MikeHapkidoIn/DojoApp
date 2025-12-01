import express from 'express';

// ======================
// 📦 IMPORTACIONES DE CONTROLADORES
// ======================

// Controladores principales de estudiantes
import { 
  getMyProfile,
  updateMyProfile,
  getAllStudents,
  getStudentById,
  updateStudent,
  deactivateStudent,
  searchStudents
} from '../controllers/studentController.js';

// Controladores para fotos
import {
  uploadMyPhoto,
  uploadStudentPhoto,
  deleteMyPhoto,
  deleteStudentPhoto
} from '../controllers/uploadController.js';

// Middlewares de autenticación
import { protect, admin } from '../middleware/auth.js';

// Middlewares para subir fotos
import {
  uploadSinglePhoto,
  handleUploadErrors,
  validatePhotoUpload
} from '../middleware/upload.js';

const router = express.Router();

// ======================
// 📱 RUTAS PARA ESTUDIANTES (necesitan estar autenticados)
// ======================

/**
 * GET /api/students/me
 * Obtener el perfil del estudiante actual
 * Solo para estudiantes autenticados
 */
router.get('/me', protect, getMyProfile);

/**
 * PUT /api/students/me
 * Actualizar datos básicos del estudiante actual
 * Solo puede actualizar: telefono, direccion, contactoEmergencia
 */
router.put('/me', protect, updateMyProfile);

// ======================
// 🖼️ NUEVO: RUTAS PARA FOTOS DE ESTUDIANTES
// ======================

/**
 * PUT /api/students/me/photo
 * Subir/actualizar foto del estudiante actual
 * 
 * FLUJO:
 * 1. protect → Verifica que el usuario está autenticado
 * 2. uploadSinglePhoto → Middleware de Multer para subir archivo
 * 3. handleUploadErrors → Maneja errores de Multer
 * 4. validatePhotoUpload → Valida que se subió un archivo
 * 5. uploadMyPhoto → Procesa y guarda la foto
 */
router.put(
  '/me/photo',                          // Ruta
  protect,                              // 1. Autenticación
  uploadSinglePhoto,                    // 2. Subir archivo
  handleUploadErrors,                   // 3. Manejo errores
  validatePhotoUpload,                  // 4. Validación
  uploadMyPhoto                         // 5. Controlador final
);

/**
 * DELETE /api/students/me/photo
 * Eliminar foto del estudiante actual
 */
router.delete('/me/photo', protect, deleteMyPhoto);

// ======================
// 👑 RUTAS PARA ADMINISTRADORES (necesitan ser admin)
// ======================

/**
 * GET /api/students
 * Obtener TODOS los estudiantes
 * Solo para administradores
 */
router.get('/', protect, admin, getAllStudents);

/**
 * GET /api/students/search
 * Buscar estudiantes con filtros
 * Solo para administradores
 */
router.get('/search', protect, admin, searchStudents);

/**
 * GET /api/students/:id
 * Obtener un estudiante específico por ID
 * Solo para administradores
 */
router.get('/:id', protect, admin, getStudentById);

/**
 * PUT /api/students/:id
 * Actualizar cualquier estudiante
 * Solo para administradores - puede actualizar TODOS los campos
 */
router.put('/:id', protect, admin, updateStudent);

/**
 * DELETE /api/students/:id
 * Desactivar estudiante (no eliminar físicamente)
 * Solo para administradores
 */
router.delete('/:id', protect, admin, deactivateStudent);

// ======================
// 🖼️ NUEVO: RUTAS PARA FOTOS (SOLO ADMIN)
// ======================

/**
 * PUT /api/students/:id/photo
 * Subir/actualizar foto de cualquier estudiante
 * Solo para administradores
 * 
 * DIFERENCIA CON /me/photo:
 * - /me/photo → Estudiante actualiza SU propia foto
 * - /:id/photo → Admin actualiza foto de CUALQUIER estudiante
 */
router.put(
  '/:id/photo',                         // Ruta con ID de estudiante
  protect,                              // 1. Autenticación
  admin,                                // 2. Verificar que es admin
  uploadSinglePhoto,                    // 3. Subir archivo
  handleUploadErrors,                   // 4. Manejo errores
  validatePhotoUpload,                  // 5. Validación
  uploadStudentPhoto                    // 6. Controlador final
);

/**
 * DELETE /api/students/:id/photo
 * Eliminar foto de cualquier estudiante
 * Solo para administradores
 */
router.delete('/:id/photo', protect, admin, deleteStudentPhoto);

export default router;