const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true }
  // Password field removed (handled in User model)
});

module.exports = mongoose.model('Admin', AdminSchema);
