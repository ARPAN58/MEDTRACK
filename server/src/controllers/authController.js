// controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../model/User');
const logger = require('../utils/logger');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

const { JWT_SECRET, JWT_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN, BCRYPT_ROUNDS } = require('../../constant');

const signToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), role: user.role, medTrackId: user.medTrackId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

const signRefreshToken = (user) =>
  jwt.sign(
    { sub: user._id.toString() },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

// POST /api/v1/auth/signup
exports.signup = asyncHandler(async (req, res) => {
  const { name, phone, email, aadhaar, password, role } = req.body;

  logger.info(`Signup attempt for email: ${email}`);

  const user = new User({ name, phone, email, aadhaar, password, role });
  const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
  user.password = await bcrypt.hash(password, salt);

  await user.save();
  logger.info(`User created successfully: ${user.medTrackId}`);

  const token = signToken(user);
  const refreshToken = signRefreshToken(user);

  return res.status(201).json({
    success: true,
    message: 'Signup successful',
    token,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      medTrackId: user.medTrackId,
      createdAt: user.createdAt,
    },
  });
});

// POST /api/v1/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  logger.info(`Login attempt for: ${identifier}`);

  const query = identifier.includes('@') ? { email: identifier } : { phone: identifier };
  const user = await User.findOne(query).select('+password');

  if (!user) {
    logger.warn(`Login failed: User not found for ${identifier}`);
    throw new AppError('Invalid credentials', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    logger.warn(`Login failed: Invalid password for ${identifier}`);
    throw new AppError('Invalid credentials', 401);
  }

  const token = signToken(user);
  const refreshToken = signRefreshToken(user);
  logger.info(`Login successful for: ${user.medTrackId}`);

  return res.json({
    success: true,
    message: 'Login successful',
    token,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      medTrackId: user.medTrackId,
      createdAt: user.createdAt,
    },
  });
});
    console.error('❌ Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
