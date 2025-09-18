import React, { useState } from 'react';

const FeedbackForm = ({ students, projects, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    projectTitle: '',
    rubricScores: {
      understanding: 0,
      implementation: 0,
      presentation: 0,
      creativity: 0,
      overall: 0
    },
    comments: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRubricChange = (category, value) => {
    setFormData((prev) => ({
      ...prev,
      rubricScores: {
        ...prev.rubricScores,
        [category]: parseInt(value, 10)
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.studentId) {
      setError('Please select a student');
      return;
    }
    
    if (!formData.projectTitle) {
      setError('Please enter a project title');
      return;
    }
    
    // Check that all rubric scores are between 0-10
    const scores = Object.values(formData.rubricScores);
    if (scores.some(score => score < 0 || score > 10)) {
      setError('All scores must be between 0 and 10');
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="studentId" className="form-label dark:text-gray-300">Student</label>
        <select
          id="studentId"
          name="studentId"
          value={formData.studentId}
          onChange={handleChange}
          className="form-input dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          required
        >
          <option value="">Select a student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.username}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="projectTitle" className="form-label dark:text-gray-300">Project Title</label>
        <input
          type="text"
          id="projectTitle"
          name="projectTitle"
          value={formData.projectTitle}
          onChange={handleChange}
          className="form-input dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          required
        />
      </div>

      <div className="mb-4">
        <label className="form-label mb-2 dark:text-gray-300">Rubric Scores (0-10)</label>
        
        <div className="grid grid-cols-1 gap-4 mb-4">
          {/* Understanding */}
          <div className="flex items-center">
            <span className="w-1/3 text-sm dark:text-gray-300">Understanding:</span>
            <input
              type="number"
              min="0"
              max="10"
              value={formData.rubricScores.understanding}
              onChange={(e) => handleRubricChange('understanding', e.target.value)}
              className="form-input dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              required
            />
          </div>
          
          {/* Implementation */}
          <div className="flex items-center">
            <span className="w-1/3 text-sm dark:text-gray-300">Implementation:</span>
            <input
              type="number"
              min="0"
              max="10"
              value={formData.rubricScores.implementation}
              onChange={(e) => handleRubricChange('implementation', e.target.value)}
              className="form-input dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              required
            />
          </div>
          
          {/* Presentation */}
          <div className="flex items-center">
            <span className="w-1/3 text-sm dark:text-gray-300">Presentation:</span>
            <input
              type="number"
              min="0"
              max="10"
              value={formData.rubricScores.presentation}
              onChange={(e) => handleRubricChange('presentation', e.target.value)}
              className="form-input dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              required
            />
          </div>
          
          {/* Creativity */}
          <div className="flex items-center">
            <span className="w-1/3 text-sm dark:text-gray-300">Creativity:</span>
            <input
              type="number"
              min="0"
              max="10"
              value={formData.rubricScores.creativity}
              onChange={(e) => handleRubricChange('creativity', e.target.value)}
              className="form-input dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              required
            />
          </div>
          
          {/* Overall */}
          <div className="flex items-center">
            <span className="w-1/3 text-sm dark:text-gray-300">Overall:</span>
            <input
              type="number"
              min="0"
              max="10"
              value={formData.rubricScores.overall}
              onChange={(e) => handleRubricChange('overall', e.target.value)}
              className="form-input dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              required
            />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="comments" className="form-label dark:text-gray-300">Comments</label>
        <textarea
          id="comments"
          name="comments"
          value={formData.comments}
          onChange={handleChange}
          rows="4"
          className="form-input dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
        ></textarea>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
        >
          Submit Feedback
        </button>
      </div>
    </form>
  );
};

export default FeedbackForm;