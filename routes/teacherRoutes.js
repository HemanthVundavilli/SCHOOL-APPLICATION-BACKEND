const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const authMiddleware = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');
// Protected routes with role checks
router.get('/me', authMiddleware(['teacher']), teacherController.getMyProfile);
router.get('/attendance', authMiddleware(['teacher']), teacherController.getMyAttendance);
router.get('/students', authMiddleware(['admin','teacher']), teacherController.getAllStudents);
router.post('/students', authMiddleware(['teacher']), teacherController.createStudent);

// Attendance update route kept with teacher role
router.put('/students/:id/attendance', authMiddleware(['teacher']), teacherController.updateStudentAttendance);

// Student update route allows both admin and teacher roles but no ownership check
router.put('/students/:id', authMiddleware(['admin', 'teacher']), teacherController.updateStudent);

router.put('/teachers/attendance/:id', authMiddleware(['admin']), adminController.updateTeacherAttendance);

// Add a fee to a student
router.post('/students/:id/fees', authMiddleware(['admin', 'teacher']), teacherController.addFee);
// Get all fees for a student
router.get('/students/:id/fees', authMiddleware(['admin', 'teacher','student']), teacherController.getFees);
// Update a specific fee (e.g. mark paid)
router.put('/students/:studentId/fees/:feeIndex', authMiddleware(['admin', 'teacher']), teacherController.updateFee);


module.exports = router;