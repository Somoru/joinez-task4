const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'db',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'joineazy_feedback',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  // Add connection timeout to avoid hanging connections
  connectionTimeoutMillis: 5000,
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit the process, just log the error
  console.error('Database connection error:', err.message);
});

// Function to initialize the database schema
const initDb = async () => {
  let client;
  
  try {
    client = await pool.connect();
    console.log('Database connection established');
    
    await client.query('BEGIN');
    
    // Create enum type for user roles if it doesn't exist
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role AS ENUM ('instructor', 'student');
        END IF;
      END $$;
    `);
    
    // Create users table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role user_role NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Drop existing projects table if exists (for clean recreation)
    await client.query(`DROP TABLE IF EXISTS feedback;`);
    await client.query(`DROP TABLE IF EXISTS projects;`);
    
    // Create projects table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        team_members JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create feedback table if it doesn't exist (after projects table)
    await client.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL REFERENCES users(id),
        instructor_id INTEGER NOT NULL REFERENCES users(id),
        project_id INTEGER REFERENCES projects(id),
        project_title VARCHAR(255) NOT NULL,
        rubric_scores JSONB NOT NULL,
        comments TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create default users if they don't exist
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = 'password';
    const passwordHash = await bcrypt.hash(defaultPassword, salt);
    
    const instructorExists = await client.query(
      "SELECT id FROM users WHERE username = 'instructor';"
    );
    
    let instructorId;
    if (instructorExists.rowCount === 0) {
      // Generate fresh bcrypt hash for password 'password'
      const instructorResult = await client.query(
        "INSERT INTO users (username, password_hash, role) VALUES ('instructor', $1, 'instructor') RETURNING id;",
        [passwordHash]
      );
      instructorId = instructorResult.rows[0].id;
      console.log('Default instructor user created with password: password');
    } else {
      instructorId = instructorExists.rows[0].id;
      // Update password to ensure it works
      await client.query(
        "UPDATE users SET password_hash = $1 WHERE id = $2",
        [passwordHash, instructorId]
      );
      console.log('Default instructor password updated');
    }
    
    const studentExists = await client.query(
      "SELECT id FROM users WHERE username = 'student';"
    );
    
    let studentId;
    if (studentExists.rowCount === 0) {
      // Generate fresh bcrypt hash for password 'password'
      const studentResult = await client.query(
        "INSERT INTO users (username, password_hash, role) VALUES ('student', $1, 'student') RETURNING id;",
        [passwordHash]
      );
      studentId = studentResult.rows[0].id;
      console.log('Default student user created with password: password');
    } else {
      studentId = studentExists.rows[0].id;
      // Update password to ensure it works
      await client.query(
        "UPDATE users SET password_hash = $1 WHERE id = $2",
        [passwordHash, studentId]
      );
      console.log('Default student password updated');
    }
    
    // Create additional student profiles
    const additionalStudents = [
      { username: 'alexsmith', name: 'Alex Smith' },
      { username: 'mikelee', name: 'Mike Lee' },
      { username: 'sarahwilson', name: 'Sarah Wilson' },
      { username: 'jessicachen', name: 'Jessica Chen' },
      { username: 'davidjohnson', name: 'David Johnson' },
      { username: 'emmadavis', name: 'Emma Davis' }
    ];
    
    const studentIds = [studentId]; // Start with our main test student
    
    for (const student of additionalStudents) {
      const studentExists = await client.query(
        "SELECT id FROM users WHERE username = $1;",
        [student.username]
      );
      
      let newStudentId;
      if (studentExists.rowCount === 0) {
        const studentResult = await client.query(
          "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, 'student') RETURNING id;",
          [student.username, passwordHash]
        );
        newStudentId = studentResult.rows[0].id;
        studentIds.push(newStudentId);
        console.log(`Student ${student.username} created with password: password`);
      } else {
        newStudentId = studentExists.rows[0].id;
        await client.query(
          "UPDATE users SET password_hash = $1 WHERE id = $2",
          [passwordHash, newStudentId]
        );
        studentIds.push(newStudentId);
        console.log(`Student ${student.username} password updated`);
      }
    }
    
    // Create sample projects if they don't exist
    const projectsExist = await client.query("SELECT COUNT(*) FROM projects");
    if (projectsExist.rows[0].count === '0') {
      // Get all student IDs and usernames for team creation
      const allStudentsResult = await client.query(
        "SELECT id, username FROM users WHERE role = 'student'"
      );
      const allStudents = allStudentsResult.rows;
      
      // Function to get a random set of team members ensuring our test student is always included
      const getRandomTeamMembers = () => {
        // Create a random selection of students (between 2-4 members)
        const teamSize = Math.floor(Math.random() * 3) + 2;
        const shuffled = [...allStudents].filter(s => s.id !== studentId).sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, teamSize - 1); // Leave room for our main test student
        
        // Always include our main test student
        const mainStudent = allStudents.find(s => s.id === studentId);
        selected.push(mainStudent);
        
        return selected.map(s => ({
          id: s.id,
          username: s.username
        }));
      };
      
      const sampleProjects = [
        {
          title: 'Web Development Final Project',
          description: 'Build a full-stack web application using React and Node.js that allows users to create and share content.',
          team_members: getRandomTeamMembers()
        },
        {
          title: 'Data Science Portfolio',
          description: 'Create a comprehensive data analysis project with visualizations using Python, Pandas, and Matplotlib.',
          team_members: getRandomTeamMembers()
        },
        {
          title: 'Mobile App Development',
          description: 'Develop a cross-platform mobile application using React Native for tracking fitness activities and nutrition.',
          team_members: getRandomTeamMembers()
        },
        {
          title: 'Database Design Project',
          description: 'Design and implement a normalized database for an e-commerce business application with complex relationships.',
          team_members: getRandomTeamMembers()
        },
        {
          title: 'AI-Powered Chatbot',
          description: 'Create a chatbot using natural language processing to answer customer service queries.',
          team_members: getRandomTeamMembers()
        },
        {
          title: 'Cloud Infrastructure Deployment',
          description: 'Design and deploy a scalable cloud infrastructure using AWS or Azure with load balancing and auto-scaling.',
          team_members: getRandomTeamMembers()
        }
      ];
      
      for (const project of sampleProjects) {
        await client.query(
          'INSERT INTO projects (title, description, team_members) VALUES ($1, $2, $3)',
          [project.title, project.description, JSON.stringify(project.team_members)]
        );
      }
      console.log('Sample projects created');
    }
    
    // Create sample feedback entries if they don't exist
    const feedbackExists = await client.query("SELECT COUNT(*) FROM feedback");
    if (feedbackExists.rows[0].count === '0') {
      // Get all projects to reference them by ID
      const projectsResult = await client.query("SELECT id, title FROM projects");
      const projects = projectsResult.rows;
      
      // Define rubric categories for different project types
      const rubricCategories = {
        'Web Development': ['Code Quality', 'User Interface', 'Functionality', 'Documentation'],
        'Data Science': ['Data Analysis', 'Visualization', 'Methodology', 'Insights'],
        'Mobile App': ['UI/UX Design', 'Code Structure', 'Performance', 'Testing'],
        'Database': ['Schema Design', 'Normalization', 'Query Optimization', 'Documentation'],
        'AI': ['Algorithm Design', 'Model Accuracy', 'Implementation', 'Documentation'],
        'Cloud': ['Architecture', 'Security', 'Scalability', 'Documentation']
      };
      
      // Generate feedback for each project for our main student
      for (const project of projects) {
        // Determine which rubric categories to use based on project title
        let categories;
        if (project.title.includes('Web')) categories = rubricCategories['Web Development'];
        else if (project.title.includes('Data')) categories = rubricCategories['Data Science'];
        else if (project.title.includes('Mobile')) categories = rubricCategories['Mobile App'];
        else if (project.title.includes('Database')) categories = rubricCategories['Database'];
        else if (project.title.includes('AI')) categories = rubricCategories['AI'];
        else if (project.title.includes('Cloud')) categories = rubricCategories['Cloud'];
        else categories = rubricCategories['Web Development']; // Default
        
        // Generate random scores between 6-10 for each category
        const scores = {};
        categories.forEach(category => {
          scores[category] = Math.floor(Math.random() * 5) + 6; // 6-10 range
        });
        
        // Sample comments for feedback
        const comments = [
          `Great work on this project! The ${categories[0].toLowerCase()} is excellent and shows your understanding. Consider improving on ${categories[2].toLowerCase()} for better results.`,
          `This project demonstrates your skills in ${categories[1].toLowerCase()}. You could enhance the ${categories[3].toLowerCase()} to make it more comprehensive.`,
          `Solid effort on this project. Your ${categories[0].toLowerCase()} approach is innovative, but the ${categories[2].toLowerCase()} needs some refinement.`,
          `Impressive work on ${categories[1].toLowerCase()}. To reach excellence, focus on improving your ${categories[3].toLowerCase()}.`,
          `Good implementation overall. The ${categories[0].toLowerCase()} shows attention to detail, while ${categories[2].toLowerCase()} could use more work.`
        ];
        
        // Select random comment
        const comment = comments[Math.floor(Math.random() * comments.length)];
        
        // Insert feedback for the main student on this project
        await client.query(
          'INSERT INTO feedback (student_id, instructor_id, project_id, project_title, rubric_scores, comments) VALUES ($1, $2, $3, $4, $5, $6)',
          [studentId, instructorId, project.id, project.title, JSON.stringify(scores), comment]
        );
        
        // Randomly add feedback for other team members on some projects
        if (Math.random() > 0.5) { // 50% chance
          // Find team members for this project
          const teamMembersResult = await client.query(
            "SELECT team_members FROM projects WHERE id = $1",
            [project.id]
          );
          
          if (teamMembersResult.rows.length > 0) {
            const teamMembers = teamMembersResult.rows[0].team_members;
            
            for (const member of teamMembers) {
              // Skip the main student as we've already created feedback
              if (member.id === studentId) continue;
              
              // 70% chance to generate feedback for this team member
              if (Math.random() > 0.3) {
                // Generate slightly different scores
                const memberScores = {};
                categories.forEach(category => {
                  memberScores[category] = Math.floor(Math.random() * 5) + 6; // 6-10 range
                });
                
                // Select different random comment
                const memberComment = comments[Math.floor(Math.random() * comments.length)];
                
                await client.query(
                  'INSERT INTO feedback (student_id, instructor_id, project_id, project_title, rubric_scores, comments) VALUES ($1, $2, $3, $4, $5, $6)',
                  [member.id, instructorId, project.id, project.title, JSON.stringify(memberScores), memberComment]
                );
              }
            }
          }
        }
      }
      
      console.log('Sample feedback entries created');
    }
    
    await client.query('COMMIT');
    console.log('Database schema initialized successfully');
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK').catch(err => 
        console.error('Error during rollback:', err)
      );
    }
    console.error('Error initializing database schema:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Simple query function with error handling
const query = async (text, params) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  query,
  initDb,
};