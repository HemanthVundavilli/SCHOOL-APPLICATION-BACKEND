const Student = require('../models/Student');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Students can be created by admin/teachers via adminController; this is an example to get/update student info

exports.createStudent = async (req, res) => {
  try {
    const { email, password, details } = req.body;

    if (!email || !password || !details) {
      return res.status(400).json({ error: 'Email, password, and student details are required' });
    }

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

exports.getMyDetails = async (req, res) => {
  try {
    const student = await Student.findById(req.user.refId);
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

exports.updateAttendance = async (req, res) => {
  try {
    const { date, present } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    student.attendance.push({ date, present });
    await student.save();
    res.json(student);
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