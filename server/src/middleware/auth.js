// middleware/auth.js
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { JWT_SECRET } = require('../../constant');

function auth(required = true) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || '';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (required) {
        logger.warn('Missing or invalid Authorization header');
        return res.status(401).json({ 
          success: false,
          message: 'Authorization header must start with Bearer' 
        });
      }
      return next();
    }

    const token = authHeader.substring('Bearer '.length).trim();
    if (!token) {
      logger.warn('Bearer token missing');
      return res.status(401).json({ 
        success: false,
        message: 'Bearer token missing' 
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      logger.warn(`Token verification failed: ${err.message}`);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid or expired token' 
      });
    }
  };
}

module.exports = auth;
