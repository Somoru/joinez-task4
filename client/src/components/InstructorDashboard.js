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
      // Make sure we're sending the right data to the API
      const submissionData = {
        studentId: feedbackData.studentId,
        projectId: feedbackData.projectId,
        rubricScores: feedbackData.rubricScores,
        comments: feedbackData.comments
      };
      
      const response = await feedbackAPI.create(submissionData);
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
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">New Feedback</h2>
                <button 
                  onClick={() => setShowFeedbackForm(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
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