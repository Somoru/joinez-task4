import React, { useState, useEffect } from 'react';
import { studentsAPI, projectsAPI, feedbackAPI } from '../api/api';
import FeedbackForm from './FeedbackForm';
import FeedbackList from './FeedbackList';

const InstructorDashboard = () => {
  const [students, setStudents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [studentsResponse, projectsResponse, feedbackResponse] = await Promise.all([
          studentsAPI.getAll(),
          projectsAPI.getAll(),
          feedbackAPI.getAll()
        ]);

        setStudents(studentsResponse.data.data.students);
        setProjects(projectsResponse.data.data.projects);
        setFeedback(feedbackResponse.data.data.feedback);
        setError(null);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle search
  const handleSearch = async () => {
    try {
      setLoading(true);
      const [studentsResponse, feedbackResponse] = await Promise.all([
        studentsAPI.getAll(searchTerm),
        feedbackAPI.getAll({ projectTitle: searchTerm })
      ]);

      setStudents(studentsResponse.data.data.students);
      setFeedback(feedbackResponse.data.data.feedback);
      setError(null);
    } catch (error) {
      console.error('Error searching:', error);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      const response = await feedbackAPI.create(feedbackData);
      setFeedback([response.data.data.feedback, ...feedback]);
      setShowFeedbackForm(false);
      setError(null);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('Failed to submit feedback. Please try again.');
    }
  };

  if (loading && students.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Instructor Dashboard</h1>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        {/* Search and action buttons */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0 mb-6">
          <div className="flex space-x-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name or project"
              className="form-input rounded-md border-gray-300 dark:border-gray-600 shadow-sm w-full md:w-64 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
            />
            <button 
              onClick={handleSearch}
              className="btn btn-primary"
            >
              Search
            </button>
          </div>
          
          <button
            onClick={() => setShowFeedbackForm(true)}
            className="btn btn-primary"
          >
            New Feedback
          </button>
        </div>

        {/* Feedback form modal */}
        {showFeedbackForm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">New Feedback</h2>
              <FeedbackForm 
                students={students}
                projects={projects}
                onSubmit={handleFeedbackSubmit}
                onCancel={() => setShowFeedbackForm(false)}
              />
            </div>
          </div>
        )}

        {/* Feedback list */}
        <FeedbackList 
          feedback={feedback} 
          onSelect={setSelectedFeedback}
          selectedFeedback={selectedFeedback}
          isInstructor={true}
        />
      </div>
    </div>
  );
};

export default InstructorDashboard;