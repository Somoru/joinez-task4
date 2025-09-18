import React, { useState, useEffect } from 'react';

const FeedbackForm = ({ students, projects, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    projectId: '',
    rubricScores: {
      understanding: 5,
      implementation: 5,
      presentation: 5,
      creativity: 5,
      overall: 5
    },
    comments: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  // Set initial values if projects and students are available
  useEffect(() => {
    if (students.length === 1) {
      setFormData(prev => ({ ...prev, studentId: students[0].id.toString() }));
    }
  }, [students]);

  // Update project title when project is selected
  useEffect(() => {
    if (formData.projectId && projects.length > 0) {
      const project = projects.find(p => p.id.toString() === formData.projectId.toString());
      setSelectedProject(project || null);
    } else {
      setSelectedProject(null);
    }
  }, [formData.projectId, projects]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(''); // Clear any existing errors
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

  const scoreLabels = {
    0: 'Poor',
    1: 'Very Weak',
    2: 'Weak',
    3: 'Below Average',
    4: 'Average',
    5: 'Above Average',
    6: 'Good',
    7: 'Very Good',
    8: 'Excellent',
    9: 'Outstanding',
    10: 'Perfect'
  };

  const rubricDescriptions = {
    understanding: 'Student\'s grasp of project concepts and requirements',
    implementation: 'Quality of code and technical execution',
    presentation: 'Organization, clarity, and delivery of the project',
    creativity: 'Originality and innovative approach to solving problems',
    overall: 'Overall assessment of the project quality'
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.studentId) {
      setError('Please select a student');
      return;
    }
    
    if (!formData.projectId) {
      setError('Please select a project');
      return;
    }
    
    // Check that all rubric scores are between 0-10
    const scores = Object.values(formData.rubricScores);
    if (scores.some(score => score < 0 || score > 10)) {
      setError('All scores must be between 0 and 10');
      return;
    }
    
    // Show success message briefly before submitting
    setSuccess('Submitting feedback...');
    setTimeout(() => {
      onSubmit(formData);
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4 animate-pulse" role="alert">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-4 animate-pulse" role="alert">
          <p className="font-medium">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Student Selection */}
        <div>
          <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Student *
          </label>
          <select
            id="studentId"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all"
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

        {/* Project Selection */}
        <div>
          <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project *
          </label>
          <select
            id="projectId"
            name="projectId"
            value={formData.projectId}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all"
            required
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Project Description if selected */}
      {selectedProject && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Project Details</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{selectedProject.description}</p>
          {selectedProject.team_members_details && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Team members:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedProject.team_members_details.map((member, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded-full text-gray-800 dark:text-gray-200">
                    {member.username}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">Rubric Scoring</h3>
        
        <div className="space-y-6">
          {Object.entries(formData.rubricScores).map(([category, value]) => (
            <div key={category} className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                  {category}
                </label>
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  {value}/10 - {scoreLabels[value]}
                </span>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {rubricDescriptions[category]}
              </p>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">0</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={value}
                  onChange={(e) => handleRubricChange(category, e.target.value)}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
                  required
                />
                <span className="text-xs text-gray-500">10</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="comments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Comments & Feedback
        </label>
        <textarea
          id="comments"
          name="comments"
          value={formData.comments}
          onChange={handleChange}
          placeholder="Provide constructive feedback about the project..."
          rows="4"
          className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all"
        ></textarea>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
        >
          Submit Feedback
        </button>
      </div>
    </form>
  );
};

export default FeedbackForm;