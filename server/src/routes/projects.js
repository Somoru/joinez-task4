const express = require('express');
const { 
  createProject,
  getAllProjects
} = require('../controllers/projectController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Routes
router.post('/', restrictTo('instructor'), createProject);
router.get('/', getAllProjects);

module.exports = router;