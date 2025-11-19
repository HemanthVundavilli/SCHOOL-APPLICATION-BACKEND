const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  role: {
    type: String,
    enum: ["admin", "teacher", "student"],
    required: [true, "Role is required"],
  },
  // Not required at creation — will be linked later
  refId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "role",
    required: false,
  },
});

module.exports = mongoose.model("User", UserSchema);