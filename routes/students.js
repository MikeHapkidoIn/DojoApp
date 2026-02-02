import express from 'express';



import { 
  getMyProfile,
  updateMyProfile,
  getAllStudents,
  getStudentById,
  updateStudent,
  deactivateStudent,
  searchStudents
} from '../controllers/studentController.js';


import {
  uploadMyPhoto,
  uploadStudentPhoto,
  deleteMyPhoto,
  deleteStudentPhoto
} from '../controllers/uploadController.js';


import { protect, admin } from '../middleware/auth.js';


import { uploadSinglePhoto, handleUpload } from '../middleware/upload.js';

const router = express.Router();



router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);




router.put(
  '/me/photo',
  protect,
  uploadSinglePhoto,
  handleUpload,      
  uploadMyPhoto      
);


router.delete('/me/photo', protect, deleteMyPhoto);



router.get('/', protect, admin, getAllStudents);
router.get('/search', protect, admin, searchStudents);
router.get('/:id', protect, admin, getStudentById);
router.put('/:id', protect, admin, updateStudent);
router.delete('/:id', protect, admin, deactivateStudent);


router.put(
  '/:id/photo',
  protect,
  admin,
  uploadSinglePhoto,
  handleUpload,
  uploadStudentPhoto
);


router.delete('/:id/photo', protect, admin, deleteStudentPhoto);

export default router;
