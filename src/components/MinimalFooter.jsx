import React from 'react';
import { useTheme } from '../hooks/useTheme'; // Import useTheme hook

const MinimalFooter = () => {
  const { theme } = useTheme(); // Get the current theme

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <p className="text-base text-gray-500 dark:text-gray-400 text-center">
          &copy; {new Date().getFullYear()} Freelancer Analytics. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default MinimalFooter;