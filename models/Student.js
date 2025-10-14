const mongoose = require('mongoose');

const assessmentTypes = ['FA1', 'FA2', 'FA3', 'SA1', 'SA2', 'FE'];
const subjects = ['Telugu', 'Hindi', 'English', 'Maths', 'Science', 'Social'];

// Marks schema
const markSchema = new mongoose.Schema({
  subject: { type: String, enum: subjects, required: true },
  assessments: {
    FA1: { type: Number, default: null },
    FA2: { type: Number, default: null },
    FA3: { type: Number, default: null },
    SA1: { type: Number, default: null },
    SA2: { type: Number, default: null },
    FE: { type: Number, default: null },
  },
});

// Each payment record
const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  mode: {
    type: String,
    enum: ['Cash', 'UPI', 'Netbanking'],
    required: true
  },
  receiptNumber: { type: Number} // auto-incremented globally
});

// Student schema
const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  admissionNumber: { type: String, unique: true, required: true },
  class: { type: String, required: true },
  dateOfAdmission: { type: Date, required: true, default: Date.now },

  marks: [markSchema],

  attendance: [
    {
      date: { type: Date, default: Date.now },
      present: Boolean,
    },
  ],

  totalFeeAmount: { type: Number, default: 0 }, // total annual fee
  feeDueDate: { type: Date, default: null }, // overall due date
  payments: [paymentSchema], // payment records

  motherDetails: {
    name: String,
    phone: String,
    aadharNumber: String,
    bankAccountType: String,
    accountNumber: String,
    bankName: String,
    branch: String,
    ifsc: String,
  },

  fatherDetails: {
    name: String,
    phone: String,
    aadharNumber: String,
  },

  demographics: {
    dob: Date,
    gender: String,
    address: String,
    phone: String,
  },
});

module.exports = mongoose.model('Student', StudentSchema);