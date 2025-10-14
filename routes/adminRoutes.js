const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', adminController.register); // Public or protected based on your security
router.post('/login', adminController.login);
router.get('/students', authMiddleware(['admin','teachers']), adminController.getAllStudents);
router.get('/teachers', authMiddleware(['admin']), adminController.getAllTeachers);
router.put('/student/:id', authMiddleware(['admin', 'teacher']), adminController.updateStudent);
router.put('/teacher/:id', authMiddleware(['admin']), adminController.updateTeacher);
router.put('/teachers/attendance/:id', authMiddleware(['admin']), adminController.updateTeacherAttendance);
// Add a fee to a student
router.post('/students/:id/fees', authMiddleware(['admin', 'teacher']), adminController.addFee);
// Get all fees for a student
router.get('/students/:id/fees', authMiddleware(['admin', 'teacher']), adminController.getFees);
// Update a specific fee (e.g. mark paid)
router.put('/students/:studentId/fees/:feeIndex', authMiddleware(['admin', 'teacher']), adminController.updateFee);

module.exports = router;