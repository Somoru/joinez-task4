const projectModel = require('../models/projectModel');

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Validate input
    if (!title) {
      return res.status(400).json({
        message: 'Please provide a project title',
      });
    }

    // Create project
    const project = await projectModel.createProject(title, description || '');

    res.status(201).json({
      status: 'success',
      data: {
        project,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error creating project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const { search } = req.query;
    const projects = await projectModel.getAllProjects(search || '');

    res.status(200).json({
      status: 'success',
      results: projects.length,
      data: {
        projects,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error retrieving projects',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};