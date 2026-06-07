// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const { validate, signupSchema, loginSchema } = require('../utils/validators');

// POST /api/v1/auth/signup
router.post('/auth/signup', validate(signupSchema), signup);

// POST /api/v1/auth/login
router.post('/auth/login', validate(loginSchema), login);
