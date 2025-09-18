const feedbackModel = require('../models/feedbackModel');
const userModel = require('../models/userModel');
const projectModel = require('../models/projectModel');

// Create new feedback
exports.createFeedback = async (req, res) => {
  try {
    const { studentId, projectId, rubricScores, comments } = req.body;
    const instructorId = req.user.id;

    // Validate input
    if (!studentId || !projectId || !rubricScores) {
      return res.status(400).json({
        message: 'Please provide studentId, projectId, and rubricScores',
      });
    }

    // Check if student exists
    const student = await userModel.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        message: 'Student not found',
      });
    }
    
    // Get project to retrieve title
    const projectModel = require('../models/projectModel');
    const project = await projectModel.getProjectById(projectId);
    
    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
      });
    }

    // Create feedback
    const feedback = await feedbackModel.createFeedback(
      studentId,
      instructorId,
      projectId,
      project.title,
      rubricScores,
      comments || ''
    );

    res.status(201).json({
      status: 'success',
      data: {
        feedback,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error creating feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get feedback by ID
exports.getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await feedbackModel.getFeedbackById(id);

    if (!feedback) {
      return res.status(404).json({
        message: 'Feedback not found',
      });
    }

    // Check if user has access to this feedback
    if (
      req.user.role === 'student' &&
      feedback.student_id !== req.user.id
    ) {
      return res.status(403).json({
        message: 'You do not have permission to access this feedback',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        feedback,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error retrieving feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get feedback for current student
exports.getMyFeedback = async (req, res) => {
  try {
    const studentId = req.user.id;
    const feedback = await feedbackModel.getFeedbackForStudent(studentId);

    res.status(200).json({
      status: 'success',
      results: feedback.length,
      data: {
        feedback,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error retrieving feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get feedback by project ID
exports.getFeedbackByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const feedback = await feedbackModel.getFeedbackForProject(projectId);
    
    // Get project details
    const project = await projectModel.getProjectById(projectId);
    
    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
      });
    }

    res.status(200).json({
      status: 'success',
      results: feedback.length,
      data: {
        project,
        feedback,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error retrieving feedback for project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get all feedback (for instructors)
exports.getAllFeedback = async (req, res) => {
  try {
    const { studentId, projectId, projectTitle } = req.query;
    
    const filters = {};
    if (studentId) filters.studentId = studentId;
    if (projectId) filters.projectId = projectId;
    else if (projectTitle) filters.projectTitle = projectTitle;
    
    const feedback = await feedbackModel.getAllFeedback(filters);

    res.status(200).json({
      status: 'success',
      results: feedback.length,
      data: {
        feedback,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error retrieving feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};