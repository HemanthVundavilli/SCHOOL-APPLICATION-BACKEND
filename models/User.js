const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student'], required: true },
  // refId references the related profile document per role
  refId: { 
    type: mongoose.Schema.Types.ObjectId, 
    refPath: 'role',
    required: true
  },
});

module.exports = mongoose.model('User', UserSchema);