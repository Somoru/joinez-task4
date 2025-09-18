const express = require('express');
const { getAllStudents } = require('../controllers/studentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);
router.use(restrictTo('instructor'));

// Routes
router.get('/', getAllStudents);

module.exports = router;