const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const studentController = require('../controllers/studentController');

router.get('/', authMiddleware(['admin', 'teacher']), studentController.getAllStudents);
// router.get('/:id', authMiddleware(['admin', 'teacher', 'student']), studentController.getStudentDetails);

router.put('/:id', authMiddleware(['admin']), adminController.updateStudent);

router.get('/:id', authMiddleware(['student']), studentController.getMyDetails);

router.put('/marks/:id', authMiddleware(['teacher', 'admin']), studentController.updateMarks);
router.put('/attendance/:id', authMiddleware(['teacher', 'admin']), studentController.updateAttendance);
router.put('/admin-edit/:id', authMiddleware(['admin', 'teacher']), studentController.adminUpdateStudent);
router.post('/', authMiddleware(['admin', 'teacher']), studentController.createStudent);

router.put('/students/:id', authMiddleware(['admin', 'teacher']), studentController.updateStudent);


// --- Student self routes ---
router.get('/me', authMiddleware(['student']), studentController.getMyDetails);
router.get('/me/fees/:feeId/receipt', authMiddleware(['student']), studentController.downloadMyReceipt);

// --- Admin/Teacher routes ---
router.get('/', authMiddleware(['admin', 'teacher']), studentController.getAllStudents);
router.get('/:id/fees/:feeId/receipt', authMiddleware(['admin', 'teacher']), studentController.downloadReceipt);
router.get('/:id/fees', authMiddleware(['admin', 'teacher']), studentController.getFees);
router.put('/:id/fees', authMiddleware(['admin', 'teacher']), studentController.updateFees);
router.post('/students/:id/fees', authMiddleware(['admin', 'teacher']), studentController.addFeePayment);

module.exports = router;