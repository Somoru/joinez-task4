const db = require('../db/db');
const bcrypt = require('bcryptjs');

// Create a new user
exports.createUser = async (username, password, role) => {
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Insert user into database
  const { rows } = await db.query(
    'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role',
    [username, hashedPassword, role]
  );

  return rows[0];
};

// Find user by username
exports.findByUsername = async (username) => {
  const { rows } = await db.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );

  return rows[0];
};

// Find user by ID
exports.findById = async (id) => {
  const { rows } = await db.query(
    'SELECT id, username, role FROM users WHERE id = $1',
    [id]
  );

  return rows[0];
};

// Get all students
exports.getAllStudents = async (filter = '') => {
  const { rows } = await db.query(
    `SELECT id, username, created_at 
     FROM users 
     WHERE role = 'student'
     AND username ILIKE $1
     ORDER BY username`,
    [`%${filter}%`]
  );

  return rows;
};

// Compare password
exports.comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};