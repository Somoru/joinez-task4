import React, { useState, useEffect } from 'react';
import { feedbackAPI } from '../api/api';
import FeedbackList from './FeedbackList';

const StudentDashboard = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const response = await feedbackAPI.getMyFeedback();
        setFeedback(response.data.data.feedback);
        setError(null);
      } catch (error) {
        console.error('Error fetching feedback:', error);
        setError('Failed to load your feedback. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Student Dashboard</h1>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        {feedback.length === 0 ? (
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg">
            <p className="text-gray-600 dark:text-gray-400">No feedback available yet.</p>
          </div>
        ) : (
          <FeedbackList 
            feedback={feedback}
            onSelect={setSelectedFeedback}
            selectedFeedback={selectedFeedback}
            isInstructor={false}
          />
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;