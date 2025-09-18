const jwt = require('jsonwebtoken');
const db = require('../db/db');

exports.protect = async (req, res, next) => {
  let token;

  // Check if token is present in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      message: 'You are not logged in. Please log in to access this resource.',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token
    const { rows } = await db.query(
      'SELECT id, username, role FROM users WHERE id = $1',
      [decoded.id]
    );

    if (!rows.length) {
      return res.status(401).json({
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // Add user data to request
    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid token. Please log in again.',
    });
  }
};

// Restrict access to certain roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user role is allowed
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};