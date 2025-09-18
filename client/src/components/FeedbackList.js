import React from 'react';
import { jsPDF } from 'jspdf';

const FeedbackList = ({ feedback, onSelect, selectedFeedback, isInstructor }) => {
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate average score
  const calculateAverage = (scores) => {
    const values = Object.values(scores);
    const sum = values.reduce((acc, score) => acc + score, 0);
    return (sum / values.length).toFixed(1);
  };

  // Export selected feedback as PDF
  const exportToPDF = (feedback) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Feedback Report', 105, 20, { align: 'center' });
    
    // Add metadata
    doc.setFontSize(12);
    doc.text(`Project: ${feedback.project_title}`, 20, 40);
    doc.text(`Student: ${feedback.student_name || 'N/A'}`, 20, 50);
    doc.text(`Instructor: ${feedback.instructor_name}`, 20, 60);
    doc.text(`Date: ${formatDate(feedback.created_at)}`, 20, 70);
    
    // Add rubric scores
    doc.setFontSize(16);
    doc.text('Rubric Scores:', 20, 90);
    
    doc.setFontSize(12);
    let yPos = 100;
    Object.entries(feedback.rubric_scores).forEach(([criterion, score]) => {
      const formattedCriterion = criterion.charAt(0).toUpperCase() + criterion.slice(1);
      doc.text(`${formattedCriterion}: ${score}/10`, 30, yPos);
      yPos += 10;
    });
    
    // Add average score
    doc.text(`Average Score: ${calculateAverage(feedback.rubric_scores)}/10`, 30, yPos + 10);
    
    // Add comments
    doc.setFontSize(16);
    doc.text('Comments:', 20, yPos + 30);
    
    doc.setFontSize(12);
    const splitComments = doc.splitTextToSize(feedback.comments || 'No comments provided.', 170);
    doc.text(splitComments, 20, yPos + 40);
    
    // Save the PDF
    doc.save(`feedback-${feedback.id}.pdf`);
  };

  return (
    <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
      {/* Feedback list */}
      <div className="w-full md:w-1/2">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Feedback List</h2>
        
        {feedback.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow dark:shadow-md rounded-lg p-4 text-gray-500 dark:text-gray-400">
            No feedback found.
          </div>
        ) : (
          <div className="space-y-4">
            {feedback.map((item) => (
              <div 
                key={item.id}
                onClick={() => onSelect(item)}
                className={`bg-white dark:bg-gray-800 shadow dark:shadow-md rounded-lg p-4 cursor-pointer transition duration-150 hover:shadow-md dark:hover:shadow-lg ${
                  selectedFeedback?.id === item.id ? 'ring-2 ring-primary-500 dark:ring-primary-400' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{item.project_title}</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(item.created_at)}</span>
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {isInstructor ? (
                    <p>Student: {item.student_name}</p>
                  ) : (
                    <p>Instructor: {item.instructor_name}</p>
                  )}
                </div>
                <div className="mt-2 flex items-center">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    Average: {calculateAverage(item.rubric_scores)}/10
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Feedback details */}
      <div className="w-full md:w-1/2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Feedback Details</h2>
          
          {selectedFeedback && (
            <button
              onClick={() => exportToPDF(selectedFeedback)}
              className="btn btn-secondary text-sm"
            >
              Export PDF
            </button>
          )}
        </div>
        
        {!selectedFeedback ? (
          <div className="bg-white dark:bg-gray-800 shadow dark:shadow-md rounded-lg p-6 text-gray-500 dark:text-gray-400 text-center">
            Select a feedback entry to view details.
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow dark:shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">{selectedFeedback.project_title}</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isInstructor ? (
                  <span>Student: {selectedFeedback.student_name}</span>
                ) : (
                  <span>Instructor: {selectedFeedback.instructor_name}</span>
                )}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Date: {formatDate(selectedFeedback.created_at)}
              </p>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Rubric Scores:</h4>
              <div className="space-y-2">
                {Object.entries(selectedFeedback.rubric_scores).map(([criterion, score]) => {
                  const formattedCriterion = criterion.charAt(0).toUpperCase() + criterion.slice(1);
                  return (
                    <div key={criterion} className="flex items-center">
                      <span className="w-1/3 text-sm text-gray-700 dark:text-gray-300">{formattedCriterion}:</span>
                      <div className="w-2/3 flex items-center">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                          <div 
                            className="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full" 
                            style={{ width: `${score * 10}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{score}/10</span>
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center pt-2 border-t dark:border-gray-600">
                  <span className="w-1/3 text-sm font-medium text-gray-900 dark:text-gray-100">Average:</span>
                  <span className="w-2/3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {calculateAverage(selectedFeedback.rubric_scores)}/10
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Comments:</h4>
              <p className="text-sm text-gray-800 dark:text-gray-300 whitespace-pre-wrap">
                {selectedFeedback.comments || 'No comments provided.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackList;