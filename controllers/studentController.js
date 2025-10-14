const Teacher = require('../models/Teacher');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const Counter = require('../models/Counter');
const puppeteer = require('puppeteer');
const generateReceiptHTML = require('./receiptTemplate');
const PDFDocument = require('pdfkit-table');
const path = require('path');
// ============================
// COUNTER INIT
// ============================
async function initCounter() {
  const exists = await Counter.findOne({ name: 'receiptNumber' });
  if (!exists) await Counter.create({ name: 'receiptNumber', seq: 1 });
}
initCounter();

// ============================
// FEES MANAGEMENT
// ============================

// PUT: Update total fee and due date
exports.updateFees = async (req, res) => {
  try {
    const { id } = req.params;
    const { totalFeeAmount, feeDueDate } = req.body;

    if (isNaN(totalFeeAmount) || !feeDueDate)
      return res.status(400).json({ error: 'Invalid data' });

    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    student.totalFeeAmount = totalFeeAmount;
    student.feeDueDate = feeDueDate;
    await student.save();

    res.json({ message: 'Fee details updated', student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST: Add payment
exports.addFeePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, date, mode } = req.body;

    if (isNaN(amount) || amount <= 0)
      return res.status(400).json({ error: 'Invalid payment amount' });
    if (!['Cash', 'UPI', 'Netbanking'].includes(mode))
      return res.status(400).json({ error: 'Invalid payment mode' });

    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const counter = await Counter.findOneAndUpdate(
      { name: 'receiptNumber' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    student.payments.push({
      amount,
      date: date || new Date(),
      mode,
      receiptNumber: counter.seq,
    });

    await student.save();
    res.json({ message: 'Payment added successfully', student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET: list payments for a student
exports.getFees = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id, 'payments totalFeeAmount feeDueDate');
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET: download receipt (admin/teacher)
exports.downloadReceipt = async (req, res) => {
  try {
    const { id, feeId } = req.params;
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const payment = student.payments.id(feeId);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const html = generateReceiptHTML(student, payment);

    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
    });

    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=receipt-${payment.receiptNumber}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET: logged-in student's profile
exports.getMyDetails = async (req, res) => {
  try {
    const student = await Student.findById(req.user.refId);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET: logged-in student download their own receipt


exports.downloadMyReceipt = async (req, res) => {
  try {
    const { id, feeId } = req.params;

    const student = await Student.findById(req.user.refId);
    const payment = student.payments.id(req.params.feeId);


    if (!student) return res.status(404).json({ message: 'Student not found' });

    const fee = student.fees.id(feeId);
    if (!fee) return res.status(404).json({ message: 'Fee record not found' });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=receipt_${student.name}_${feeId}.pdf`
    );
    doc.pipe(res);

    // Add logo
    const logoPath = path.join(__dirname, '../assets/school-logo.png');
    try {
      doc.image(logoPath, 50, 30, { width: 60 });
    } catch {
      console.warn('Logo not found');
    }

    // Header
    doc.fontSize(20).text('Sri Pratibha Upper Primary School', { align: 'center' });
    doc.fontSize(12).text('Vadisaleru, East Godavari, Andhra Pradesh', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(16).text('Fee Payment Receipt', { align: 'center', underline: true });
    doc.moveDown();

    // Student info
    doc.fontSize(12).text(`Name: ${student.name}`);
    doc.text(`Class: ${student.class}`);
    doc.text(`Roll No: ${student.rollNumber}`);
    doc.text(`Student ID: ${student._id}`);
    doc.moveDown(1.5);

    // Table data
    const table = {
      headers: ['Fee Type', 'Amount (₹)', 'Date', 'Payment Mode'],
      rows: [
        [
          fee.feeType || 'Tuition Fee',
          fee.amount,
          new Date(fee.date).toLocaleDateString('en-IN'),
          fee.mode || 'N/A',
        ],
      ],
    };

    await doc.table(table, {
      width: 500,
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(12),
      prepareRow: (row, i) => doc.font('Helvetica').fontSize(12),
    });

    doc.moveDown(2);
    doc.text(`Payment ID: ${feeId}`);
    doc.text(`Transaction Reference: ${fee.transactionId || 'N/A'}`);
    doc.moveDown(2);

    doc.text('Thank you for your payment.', { align: 'center' });
    doc.text('This is a computer-generated receipt. No signature required.', {
      align: 'center',
      fontSize: 10,
    });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating receipt' });
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







