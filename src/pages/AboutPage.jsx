import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserTie, FaLightbulb, FaCode, FaTools } from 'react-icons/fa';

const AboutPage = () => {
  const skills = [
    { name: 'Full-Stack Development', icon: <FaCode className="h-6 w-6" /> },
    { name: 'UI/UX Design', icon: <FaLightbulb className="h-6 w-6" /> },
    { name: 'DevOps & Cloud', icon: <FaTools className="h-6 w-6" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto h-32 w-32 rounded-full bg-blue-100 flex items-center justify-center mb-6">
            <FaUserTie className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Hi, I'm a Solo Developer</span>
            <span className="block text-blue-600">Building Tools for Freelancers</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
            I created this platform to help freelancers like me manage their business finances more effectively.
            Every feature is built with real-world experience and a focus on simplicity.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 shadow-md"
            >
              Get Started for Free
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 shadow-md"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              My Expertise
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Combining technical skills with real freelancing experience
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {skills.map((skill, index) => (
              <div key={index} className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 py-8 h-full text-center">
                  <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full text-blue-600">
                    {skill.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">{skill.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              My Approach
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <div className="text-blue-600 mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <FaCode className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Clean Code</h3>
              <p className="mt-2 text-gray-500">Maintainable and well-documented code that stands the test of time.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <div className="text-blue-600 mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <FaLightbulb className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">User-First</h3>
              <p className="mt-2 text-gray-500">Designing with real user needs and pain points in mind.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <div className="text-blue-600 mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <FaTools className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Continuous Improvement</h3>
              <p className="mt-2 text-gray-500">Always learning and implementing feedback to make the platform better.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
            <div className="px-5 py-2">
              <Link to="/about" className="text-base text-gray-500 hover:text-gray-900">
                About
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link to="/login" className="text-base text-gray-500 hover:text-gray-900">
                Login
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link to="/signup" className="text-base text-gray-500 hover:text-gray-900">
                Sign Up
              </Link>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                Privacy
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                Terms
              </a>
            </div>
          </nav>
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} Freelance Dashboard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
