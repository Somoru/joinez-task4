const db = require('../db/db');

// Create new feedback
exports.createFeedback = async (studentId, instructorId, projectId, projectTitle, rubricScores, comments) => {
  const { rows } = await db.query(
    `INSERT INTO feedback 
      (student_id, instructor_id, project_id, project_title, rubric_scores, comments) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING *`,
    [studentId, instructorId, projectId, projectTitle, rubricScores, comments]
  );

  return rows[0];
};

// Get feedback by ID
exports.getFeedbackById = async (id) => {
  const { rows } = await db.query(
    `SELECT f.*, 
      s.username AS student_name, 
      i.username AS instructor_name,
      p.title AS project_title,
      p.description AS project_description
     FROM feedback f
     JOIN users s ON f.student_id = s.id
     JOIN users i ON f.instructor_id = i.id
     LEFT JOIN projects p ON f.project_id = p.id
     WHERE f.id = $1`,
    [id]
  );

  return rows[0];
};

// Get all feedback for a specific student
exports.getFeedbackForStudent = async (studentId) => {
  const { rows } = await db.query(
    `SELECT f.*, 
      i.username AS instructor_name,
      p.title AS project_title,
      p.description AS project_description
     FROM feedback f
     JOIN users i ON f.instructor_id = i.id
     LEFT JOIN projects p ON f.project_id = p.id
     WHERE f.student_id = $1
     ORDER BY f.created_at DESC`,
    [studentId]
  );

  return rows;
};

// Get all feedback for a specific project
exports.getFeedbackForProject = async (projectId) => {
  const { rows } = await db.query(
    `SELECT f.*, 
      s.username AS student_name, 
      i.username AS instructor_name
     FROM feedback f
     JOIN users s ON f.student_id = s.id
     JOIN users i ON f.instructor_id = i.id
     WHERE f.project_id = $1
     ORDER BY f.created_at DESC`,
    [projectId]
  );

  return rows;
};

// Get all feedback with filtering options
exports.getAllFeedback = async (filters = {}) => {
  let query = `
    SELECT f.*, 
      s.username AS student_name, 
      i.username AS instructor_name,
      p.title AS project_title,
      p.description AS project_description
    FROM feedback f
    JOIN users s ON f.student_id = s.id
    JOIN users i ON f.instructor_id = i.id
    LEFT JOIN projects p ON f.project_id = p.id
    WHERE 1=1
  `;
  
  const params = [];
  let paramIndex = 1;
  
  if (filters.studentId) {
    query += ` AND f.student_id = $${paramIndex}`;
    params.push(filters.studentId);
    paramIndex++;
  }
  
  if (filters.projectId) {
    query += ` AND f.project_id = $${paramIndex}`;
    params.push(filters.projectId);
    paramIndex++;
  } else if (filters.projectTitle) {
    query += ` AND f.project_title ILIKE $${paramIndex}`;
    params.push(`%${filters.projectTitle}%`);
    paramIndex++;
  }
  
  query += ` ORDER BY f.created_at DESC`;
  
  const { rows } = await db.query(query, params);
  
  return rows;
};