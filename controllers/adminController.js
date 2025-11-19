const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');

exports.register = async (req, res) => {
  const { email, password, role, details } = req.body;

  if (!email || typeof email !== 'string' || email.trim() === '') {
    return res.status(400).json({ error: 'Email is required' });
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
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    // 1. Create user first (no refId yet)
    const hashedPwd = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPwd, role });

    // 2. Create role-specific profile linked to this user
    let profile;
    if (role === 'teacher') {
      const { name, phone, subject, classes, demographicDetails } = details;
      profile = await Teacher.create({
        user: user._id,                // ✅ required link
        name,
        phone,
        subject,
        classes: Array.isArray(classes) ? classes : [],
        demographicDetails,
      });
    } else if (role === 'student') {
      profile = await Student.create({ ...details, user: user._id });
    } else if (role === 'admin') {
      profile = await Admin.create({ ...details, user: user._id });
    }

    // 3. Update user with refId of created profile
    user.refId = profile._id;
    await user.save();

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`,
      userId: user._id,
    });
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
    const students = await Student.find().populate({
      path: "user",
      select: "email",
      strictPopulate: false
    });

    const formatted = students.map(s => ({
      _id: s._id,
      name: s.name,
      admissionNumber: s.admissionNumber,
      class: s.class,
      dateOfAdmission: s.dateOfAdmission,
      demographics: s.demographics,
      motherDetails: s.motherDetails,
      fatherDetails: s.fatherDetails,
      email: s.user?.email || ""
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate({
      path: "user",
      select: "email", // fetch only email from User
      strictPopulate: false, // prevent Mongoose 7 error if some teachers lack user
    });

    const formatted = teachers.map(t => ({
      _id: t._id,
      name: t.name,
      phone: t.phone,
      subject: t.subject,
      classes: t.classes,
      demographicDetails: t.demographicDetails,
      attendance: t.attendance,
      email: t.user?.email || "", // attach email if found
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Error fetching teachers:", err);
    res.status(500).json({ error: err.message });
  }
};



exports.updateTeacher = async (req, res) => {
  try {
    const { email, password, ...teacherData } = req.body;
    const teacher = await Teacher.findById(req.params.id).populate("user");

    if (!teacher) return res.status(404).json({ error: "Teacher not found" });

    // update teacher data
    Object.assign(teacher, teacherData);
    await teacher.save();

    // update linked user if email/password provided
    if (email || password) {
      const user = await User.findById(teacher.user);
      if (email) user.email = email;
      if (password) user.password = await bcrypt.hash(password, 10);
      await user.save();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Delete teacher document
    await Teacher.findByIdAndDelete(req.params.id);

    // Delete login user with same email
    await User.findOneAndDelete({ email: teacher.email });

    res.json({ message: "Teacher deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete teacher" });
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

    if (!teacher.user) {
      return res.status(400).json({ error: "Teacher 'user' field is missing, cannot update attendance." });
    }

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
    console.error('Error in updateTeacherAttendance:', err);
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

