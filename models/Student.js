const { time } = require('console');
const mongoose = require('mongoose');

const assessmentTypes = ['FA1', 'FA2', 'FA3', 'SA1', 'SA2', 'FE'];
const subjects = ['Telugu', 'Hindi', 'English', 'Maths', 'Science', 'Social'];

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

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  admissionNumber: { type: String, unique: true, required: true },
  class: { type: String, required: true },                // Added class field
  dateOfAdmission: { type: Date, required: true, default: Date.now },        // Added dateOfAdmission field
  marks: [{ subject: String, score: Number }],
attendance: [
  {
    date: { type: Date, default: Date.now },
    present: Boolean
  }
],
  
  motherDetails: {
    name: String,
    phone: String,
    aadharNumber: String,              // Added mother aadhar number
    bankAccountType: String,           // Added mother bank account type (e.g. Savings/Current)
    accountNumber: String,             // Added mother bank account number
    bankName: String,                  // Added bank name
    branch: String,                   // Added branch
    ifsc: String                      // Added IFSC code
  },

  fatherDetails: {
    name: String,
    phone: String,
    aadharNumber: String               // Added father aadhar number
  },

  demographics: {
    dob: Date,
    gender: String,
    address: String,
    phone: String
  },
  marks: [markSchema],
});

module.exports = mongoose.model('Student', StudentSchema);