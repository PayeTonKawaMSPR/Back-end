// routes/authRoutes.js
const express = require('express');
const router = express.Router();

const { signup, login } = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../validations/clientValidation');

// Route inscription
router.post('/signup', validateSignup, signup);

// Route connexion
router.post('/login', validateLogin, login);

module.exports = router;
