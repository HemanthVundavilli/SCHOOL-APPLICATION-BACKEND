const express = require('express');
const router = express.Router();

const authController = require('../controllers/adminController'); // or authController file where login is

router.post('/login', authController.login);
router.post('/register', authController.register);


module.exports = router;