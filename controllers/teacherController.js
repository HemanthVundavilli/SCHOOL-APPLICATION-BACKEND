const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

exports.getMyProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    res.json(teacher);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};



// Get logged in teacher's attendance history
exports.getMyAttendance = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id, 'attendance');
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    res.json(teacher.attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all students assigned to this teacher
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    };

// Create new student assigned to logged-in teacher
exports.createStudent = async (req, res) => {
  try {
    const { email, password, ...details } = req.body;
    if (!email || !password || !details) {
      return res.status(400).json({ error: 'Email, password, and student details are required' });
    }

    // Assign teacherId from logged in teacher
    details.teacherId = req.user.id;

    // TODO: Validate email uniqueness across students, hash password, create user record if needed (depending on your auth setup)

    const student = new Student(details);
    await student.save();

    res.status(201).json(student);
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

// Update student attendance (mark present/absent on a date)
exports.updateStudentAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, present } = req.body;

    if (!date || typeof present !== 'boolean') {
      return res.status(400).json({ error: 'date and present boolean are required' });
    }

    const student = await Student.findOne({ _id: id, teacherId: req.user.id });
    if (!student) return res.status(404).json({ error: 'Student not found or unauthorized' });

    if (!student.attendance) student.attendance = [];

    const idx = student.attendance.findIndex(a => a.date.toISOString().startsWith(date));
    if (idx !== -1) {
      student.attendance[idx].present = present;
    } else {
      student.attendance.push({ date: new Date(date), present });
    }

    await student.save();
    res.json({ message: 'Attendance updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error during attendance update' });
  }
};