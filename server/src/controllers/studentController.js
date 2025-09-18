const userModel = require('../models/userModel');

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const { search } = req.query;
    const students = await userModel.getAllStudents(search || '');

    res.status(200).json({
      status: 'success',
      results: students.length,
      data: {
        students,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error retrieving students',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};