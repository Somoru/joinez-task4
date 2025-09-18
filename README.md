# Joineazy Feedback & Evaluation Dashboard

A full-stack web application for providing structured feedback on student projects. This platform allows instructors to submit detailed evaluations and students to view their feedback.

## Architecture

This project follows a monorepo structure with:

- **Frontend**: React application with Tailwind CSS styling
- **Backend**: Node.js/Express RESTful API with JWT authentication
- **Database**: PostgreSQL
- **Containerization**: Docker and Docker Compose

## Features

### Instructor Features:
- View all students and projects
- Search and filter students by name
- Submit structured feedback using rubric scores
- View all submitted feedback
- Export feedback as PDF

### Student Features:
- View feedback for their projects
- See detailed breakdowns of rubric scores
- Download feedback as PDF

## Project Structure

```
joineazy-feedback/
├── client/                     # React frontend
│   ├── src/
│   │   ├── api/                # API services
│   │   ├── components/         # React components
│   │   ├── context/            # Context API for state management
│   │   ├── App.js              # Main App component
│   │   └── index.js            # Entry point
│   ├── Dockerfile              # Frontend Docker configuration
│   └── package.json            # Frontend dependencies
├── server/                     # Express backend
│   ├── src/
│   │   ├── controllers/        # Route controllers
│   │   ├── db/                 # Database connection
│   │   ├── middleware/         # Express middleware
│   │   ├── models/             # Data models
│   │   ├── routes/             # API routes
│   │   └── index.js            # Server entry point
│   ├── Dockerfile              # Backend Docker configuration
│   └── package.json            # Backend dependencies
├── docker-compose.yml          # Docker Compose configuration
├── .env                        # Environment variables
└── README.md                   # This file
```

## Getting Started

### Prerequisites

- Docker and Docker Compose

### Running the Application

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd joineazy-feedback
   ```

2. Create a `.env` file in the root directory with the following variables (or use the default):
   ```
   POSTGRES_DB=joineazy_feedback
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   JWT_SECRET=your_secret_key_here
   NODE_ENV=production
   ```

3. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login and receive JWT
- `GET /api/auth/me`: Get current user profile

### Feedback
- `POST /api/feedback`: Submit new feedback (instructor only)
- `GET /api/feedback`: Get all feedback (instructor only)
- `GET /api/feedback/me`: Get feedback for current student (student only)
- `GET /api/feedback/:id`: Get specific feedback by ID

### Students
- `GET /api/students`: Get all students (instructor only)

### Projects
- `POST /api/projects`: Create a new project (instructor only)
- `GET /api/projects`: Get all projects

## Development

### Running the Application in Development Mode

1. Start the containers in development mode:
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

2. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Troubleshooting

If you encounter issues with the containers:

1. **Server container exiting:**
   ```bash
   # View logs for the server container
   docker logs joineazy_server
   
   # Restart the server container
   docker-compose restart server
   ```

2. **Database connection issues:**
   ```bash
   # Check if the database is running
   docker ps
   
   # Connect to the database to verify it's working
   docker exec -it joineazy_db psql -U postgres -d joineazy_feedback
   ```

3. **Client shows 404 errors:**
   - The React development server might still be starting up
   - Wait a few moments and refresh the page
   - Check if the client container is running with `docker ps`

### Default Users and Sample Data

The application automatically creates the following test accounts and sample data when first initialized:

1. Instructor Account:
   - Username: instructor
   - Password: password
   - Role: instructor

2. Student Account:
   - Username: student
   - Password: password
   - Role: student

#### Sample Projects
The system is pre-populated with the following sample projects:
- Web Development Final Project
- Data Science Portfolio
- Mobile App Development
- Database Design Project

#### Sample Feedback
Sample feedback entries are created for the student account across multiple projects with different rubric scores and detailed comments. This allows you to immediately see how the feedback system works without having to create entries manually.

## Technologies Used

- **Frontend**: React, React Router, Tailwind CSS, Axios, jsPDF
- **Backend**: Node.js, Express, JSON Web Tokens
- **Database**: PostgreSQL
- **Containerization**: Docker, Docker Compose

## License

This project is licensed under the MIT License.