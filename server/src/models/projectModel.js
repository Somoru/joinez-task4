const db = require('../db/db');

// Create a new project
exports.createProject = async (title, description, teamMembers = []) => {
  const { rows } = await db.query(
    'INSERT INTO projects (title, description, team_members) VALUES ($1, $2, $3) RETURNING *',
    [title, description, JSON.stringify(teamMembers)]
  );

  return rows[0];
};

// Get project by ID
exports.getProjectById = async (id) => {
  const { rows } = await db.query(
    `SELECT p.*, 
      (SELECT json_agg(json_build_object('id', u.id, 'username', u.username)) 
       FROM users u 
       WHERE u.id = ANY(SELECT (jsonb_array_elements(p.team_members)->>'id')::int)) AS team_members_details
     FROM projects p
     WHERE p.id = $1`,
    [id]
  );

  return rows[0];
};

// Get all projects
exports.getAllProjects = async (filter = '') => {
  const { rows } = await db.query(
    `SELECT p.*,
      (SELECT json_agg(json_build_object('id', u.id, 'username', u.username)) 
       FROM users u 
       WHERE u.id = ANY(SELECT (jsonb_array_elements(p.team_members)->>'id')::int)) AS team_members_details
     FROM projects p
     WHERE p.title ILIKE $1
     ORDER BY p.created_at DESC`,
    [`%${filter}%`]
  );

  return rows;
};

// Get projects for a specific student
exports.getProjectsForStudent = async (studentId) => {
  const { rows } = await db.query(
    `SELECT p.*,
      (SELECT json_agg(json_build_object('id', u.id, 'username', u.username)) 
       FROM users u 
       WHERE u.id = ANY(SELECT (jsonb_array_elements(p.team_members)->>'id')::int)) AS team_members_details
     FROM projects p
     WHERE p.team_members @> ANY(ARRAY[(SELECT jsonb_build_object('id', $1::int))])
     ORDER BY p.created_at DESC`,
    [studentId]
  );

  return rows;
};

// Update a project
exports.updateProject = async (id, title, description, teamMembers) => {
  const { rows } = await db.query(
    `UPDATE projects 
     SET title = $2, 
         description = $3, 
         team_members = $4,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [id, title, description, JSON.stringify(teamMembers)]
  );

  return rows[0];
};