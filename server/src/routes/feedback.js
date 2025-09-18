const express = require('express');
const { 
  createFeedback, 
  getFeedbackById,
  getMyFeedback,
  getAllFeedback,
  getFeedbackByProject
} = require('../controllers/feedbackController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Routes
router.post('/', restrictTo('instructor'), createFeedback);
router.get('/me', restrictTo('student'), getMyFeedback);
router.get('/project/:projectId', getFeedbackByProject);
router.get('/', restrictTo('instructor'), getAllFeedback);
router.get('/:id', getFeedbackById);

module.exports = router;