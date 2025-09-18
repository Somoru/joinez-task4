import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';
import InstructorDashboard from './InstructorDashboard';
import StudentDashboard from './StudentDashboard';

const Dashboard = () => {
  const { user, logout } = useAuth();
  // We're using useTheme hook to enable theme context but not actually using the theme variable
  useTheme();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-200 bg-gray-50 dark:bg-gray-900">
      {/* Navigation bar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                Joineazy Feedback Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Signed in as <span className="font-medium">{user.username}</span> 
                <span className="ml-1 px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                  {user.role}
                </span>
              </span>
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 transition-colors duration-200 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
        {user.role === 'instructor' ? (
          <InstructorDashboard />
        ) : (
          <StudentDashboard />
        )}
      </main>
    </div>
  );
};

export default Dashboard;