import React from 'react';

const MinimalFooter = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <p className="text-base text-gray-500 text-center">
          &copy; {new Date().getFullYear()} Freelancer Analytics. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default MinimalFooter;
