const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// Create JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Check if all required fields are provided
    if (!username || !password || !role) {
      return res.status(400).json({
        message: 'Please provide username, password, and role',
      });
    }

    // Check if role is valid
    if (!['instructor', 'student'].includes(role)) {
      return res.status(400).json({
        message: 'Role must be either "instructor" or "student"',
      });
    }

    // Check if user already exists
    const existingUser = await userModel.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({
        message: 'User with this username already exists',
      });
    }

    // Create new user
    const newUser = await userModel.createUser(username, password, role);

    // Generate JWT token
    const token = generateToken(newUser.id);

    // Return user data and token
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error registering user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({
        message: 'Please provide username and password',
      });
    }

    // Check if user exists
    const user = await userModel.findByUsername(username);
    if (!user) {
      return res.status(401).json({
        message: 'Invalid username or password',
      });
    }

    // Check if password is correct
    const isPasswordValid = await userModel.comparePassword(
      password,
      user.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid username or password',
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Return user data and token
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    // User is already available from authMiddleware
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error getting user data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};