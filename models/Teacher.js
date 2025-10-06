const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: String,
  subject: String,
  classes: [String],
  demographicDetails: {
    dob: Date,
    gender: String,
    address: String,
  },
  attendance: [
    {
      date: { type: Date, required: true },
      present: { type: Boolean, required: true },
    }
  ],
});

module.exports = mongoose.model('Teacher', TeacherSchema);