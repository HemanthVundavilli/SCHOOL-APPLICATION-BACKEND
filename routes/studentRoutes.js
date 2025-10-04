const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const studentController = require('../controllers/studentController');

router.get('/', authMiddleware(['admin', 'teacher']), studentController.getAllStudents);
// router.get('/:id', authMiddleware(['admin', 'teacher', 'student']), studentController.getStudentDetails);

router.put('/:id', authMiddleware(['admin']), adminController.updateStudent);

router.get('/me', authMiddleware(['student']), studentController.getMyDetails);
router.put('/marks/:id', authMiddleware(['teacher', 'admin']), studentController.updateMarks);
router.put('/attendance/:id', authMiddleware(['teacher', 'admin']), studentController.updateAttendance);
router.put('/admin-edit/:id', authMiddleware(['admin', 'teacher']), studentController.adminUpdateStudent);
router.post('/', authMiddleware(['admin', 'teacher']), studentController.createStudent);

router.put('/students/:id', authMiddleware(['admin', 'teacher']), studentController.updateStudent);
module.exports = router;