const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');

// Admin can create students and teachers, and admins
exports.register = async (req, res) => {
  const { email, password, role, details } = req.body;

  // Validate required fields and email format
  if (!email || typeof email !== 'string' || email.trim() === '') {
    return res.status(400).json({ error: 'Email is required and must be non-empty' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  if (!role || !['student', 'teacher', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  if (!details) {
    return res.status(400).json({ error: 'Details object is required' });
  }

  try {
    // Check existing user by email
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    // Create profile document based on role
    let refDoc;
    if (role === 'student') refDoc = await Student.create(details);
    else if (role === 'teacher') refDoc = await Teacher.create(details);
    else if (role === 'admin') refDoc = await Admin.create(details);

    // Hash password and create User
    const hashedPwd = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPwd, role, refId: refDoc._id });

    res.status(201).json({ success: true, userId: user._id });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  try {
    const user = await User.findOne({ email });
    console.log('Login attempt email:', email);
    console.log('User found:', user ? user.email : 'no user');
    console.log('Password hash:', user ? user.password : 'N/A');

    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: user._id, role: user.role, refId: user.refId }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const updated = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTeacherAttendance = async (req, res) => {
  const teacherId = req.params.id;
  const { date, present } = req.body;

  if (!date || typeof present !== 'boolean') {
    return res.status(400).json({ error: 'Date and present status are required' });
  }

  try {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    const existingRecordIndex = teacher.attendance.findIndex(r =>
      r.date.toISOString().slice(0, 10) === new Date(date).toISOString().slice(0, 10)
    );

    if (existingRecordIndex >= 0) {
      teacher.attendance[existingRecordIndex].present = present;
    } else {
      teacher.attendance.push({ date, present });
    }

    await teacher.save();
    res.json({ success: true, attendance: teacher.attendance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.updateStudent = async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addFee = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, dueDate, mode, notes } = req.body;
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    student.fees.push({ amount, dueDate, mode, notes });
    await student.save();
    res.status(201).json(student.fees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFees = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id, 'fees');
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student.fees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateFee = async (req, res) => {
  try {
    const { studentId, feeIndex } = req.params;
    const { paid, paymentDate, receiptNumber } = req.body;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: "Student not found" });

    if (!student.fees[feeIndex]) return res.status(404).json({ error: "Fee entry not found" });

    const fee = student.fees[feeIndex];
    if (paid !== undefined) fee.paid = paid;
    if (paymentDate) fee.paymentDate = paymentDate;
    if (receiptNumber) fee.receiptNumber = receiptNumber;

    await student.save();
    res.json(student.fees[feeIndex]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

