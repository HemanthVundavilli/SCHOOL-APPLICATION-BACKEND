require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin'); // adjust path if needed

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = 'newa@example.com';
    const plainPassword = 'AdminPass123';
    const name = 'test-User1';  // Add required name field

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const admin = new Admin({
      name,              // <-- include this
      email,
      password: hashedPassword
    });

    await admin.save();

    console.log('Admin created:', admin);
    mongoose.disconnect();
  } catch (err) {
    console.error('Error creating admin:', err);
  }
}

createAdmin();