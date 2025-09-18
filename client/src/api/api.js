import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Students API
export const studentsAPI = {
  getAll: (search = '') => api.get(`/students?search=${search}`),
};

// Projects API
export const projectsAPI = {
  getAll: (search = '') => api.get(`/projects?search=${search}`),
  create: (projectData) => api.post('/projects', projectData),
};

// Feedback API
export const feedbackAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.studentId) params.append('studentId', filters.studentId);
    if (filters.projectTitle) params.append('projectTitle', filters.projectTitle);
    
    return api.get(`/feedback?${params.toString()}`);
  },
  getById: (id) => api.get(`/feedback/${id}`),
  getMyFeedback: () => api.get('/feedback/me'),
  create: (feedbackData) => api.post('/feedback', feedbackData),
};

export default api;