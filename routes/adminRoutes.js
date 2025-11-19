const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', adminController.register);
router.post('/login', adminController.login);

// Corrected role name: "teacher"
router.get('/students', authMiddleware(['admin', 'teacher']), adminController.getAllStudents);
router.get('/teachers', authMiddleware(['admin']), adminController.getAllTeachers);

router.put('/student/:id', authMiddleware(['admin', 'teacher']), adminController.updateStudent);
router.put('/teacher/:id', authMiddleware(['admin']), adminController.updateTeacher);
router.delete('/:id', authMiddleware(['admin']), adminController.deleteTeacher);
router.put('/teachers/attendance/:id', authMiddleware(['admin']), adminController.updateTeacherAttendance);

// Fee management routes
router.post('/students/:id/fees', authMiddleware(['admin', 'teacher']), adminController.addFee);
router.get('/students/:id/fees', authMiddleware(['admin', 'teacher']), adminController.getFees);
router.put('/students/:studentId/fees/:feeIndex', authMiddleware(['admin', 'teacher']), adminController.updateFee);

module.exports = router;