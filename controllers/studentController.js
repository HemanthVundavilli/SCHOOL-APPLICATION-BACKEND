const Teacher = require('../models/Teacher');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');


exports.createTeacher = async (req, res) => {
  try {
    const { email, password, details } = req.body;

    if (!email || !password || !details) {
      return res.status(400).json({ error: 'Email, password, and teacher details are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    const teacher = await Teacher.create(details);

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      password: hashedPassword,
      role: 'teacher',
      refId: teacher._id,
    });

    res.status(201).json({ message: 'Teacher created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllStudents = async (req, res) => {
  // Example: you can implement actual fetching here
  res.send('getAllStudents works');
};

exports.getStudentDetails = async (req, res) => {
  // Example placeholder
  res.send(`getStudentDetails works for student id ${req.params.id}`);
};

exports.editStudent = async (req, res) => {
  // Example placeholder
  res.send(`editStudent works for student id ${req.params.id}`);
};

exports.updateMyProfile = async (req, res) => {
  // Example placeholder
  res.send(`updateMyProfile works for teacher id ${req.user.refId}`);
};
exports.getMyDetails = async (req, res) => {
  try {
    // Use authenticated user's ID from token/session data
    const student = await Student.findById(req.user.id); 
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMarks = async (req, res) => {
  try {
    const { marks } = req.body;
    const student = await Student.findByIdAndUpdate(req.params.id, { marks }, { new: true });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// controllers/studentController.js or teacherController.js

exports.updateAttendance = async (req, res) => {
  try {
    const id = req.params.id;
    const { date, present } = req.body;

    if (!date || typeof present !== 'boolean') {
      return res.status(400).json({ error: 'Date and present status are required' });
    }

    const Model = req.user.role === 'student' ? Teacher : Student;
    const doc = await Model.findById(id);
    if (!doc) return res.status(404).json({ error: 'Not found' });

    // Find attendance entry for date (match start of ISO string)
    const attIndex = doc.attendance.findIndex(a => a.date?.toISOString().startsWith(date));
    if (attIndex >= 0) {
      // Update existing
      doc.attendance[attIndex].present = present;
    } else {
      // Add new attendance record
      doc.attendance.push({ date: new Date(date), present });
    }

    await doc.save();
    res.json({ message: 'Attendance updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.adminUpdateStudent = async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Student not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { email, password, details } = req.body;

    if (!email || !password || !details) {
      return res.status(400).json({ error: 'Email, password, and student details are required' });
    }

    // Ensure email is unique in User collection
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    const student = await Student.create(details);

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      password: hashedPassword,
      role: 'student',
      refId: student._id,
    });

    res.status(201).json({ message: 'Student created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    Object.assign(student, req.body);
    await student.save();
    res.json({ message: 'Student updated successfully', student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

