const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors({
   origin: [
    "http://localhost:3000",
    "https://school-application-frontend.vercel.app",
    "https://sripratibha.vercel.app"
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json());

app.use('/api',studentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected:', process.env.MONGO_URI))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
