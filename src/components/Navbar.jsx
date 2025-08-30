// src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { useAuth } from "../hooks/useAuth";
import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";
import { 
  FiUser, 
  FiLogIn, 
  FiUserPlus, 
  FiHome, 
  FiMenu, 
  FiX,
  FiSun,
  FiMoon
} from "react-icons/fi";
import { useTheme } from '../hooks/useTheme'; // Import the useTheme hook

function Navbar() {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme(); // Get theme and toggle function

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg dark:from-gray-800 dark:to-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Branding */}
          <div className="flex items-center">
            <Link 
              to={currentUser ? "/dashboard" : "/"}
              className="flex items-center gap-2 group"
              aria-label={currentUser ? "Dashboard" : "Home"}
            >
              <Logo size={36} className="group-hover:scale-105 transition-transform" />
              <span className="text-xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-blue-300 ml-2">
                Freelancer Analytics
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-700/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <FiMoon className="h-5 w-5" /> : <FiSun className="h-5 w-5" />}
            </button>
            
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <NavLink 
                  to="/dashboard/settings" 
                  icon={<FiUser />} 
                  text="Settings"
                />
              </div>
            ) : (
              <>
                <NavLink to="/" icon={<FiHome />} text="Home" />
                <NavLink to="/login" icon={<FiLogIn />} text="Login" />
                <NavLink 
                  to="/signup" 
                  icon={<FiUserPlus />} 
                  text="Sign Up" 
                  isPrimary 
                />
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Theme Toggle Button for mobile */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-700/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <FiMoon className="h-5 w-5" /> : <FiSun className="h-5 w-5" />}
            </button>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-700/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
              aria-expanded="false"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? (
                <FiX className="block h-6 w-6" />
              ) : (
                <FiMenu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-700/20 mx-4 rounded-lg my-2 dark:bg-gray-800/50">
          {/* Theme toggle for mobile menu */}
          <div className="flex justify-center py-2">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-700/30 transition-colors"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <FiMoon className="h-5 w-5" /> : <FiSun className="h-5 w-5" />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>
          
          {currentUser ? (
            <div className="flex flex-col space-y-2 p-2">
              <MobileNavLink to="/dashboard" icon={<FiHome />} text="Dashboard" />
              <MobileNavLink to="/dashboard/settings" icon={<FiUser />} text="Settings" />
            </div>
          ) : (
            <>
              <MobileNavLink to="/" icon={<FiHome />} text="Home" />
              <MobileNavLink to="/login" icon={<FiLogIn />} text="Login" />
              <MobileNavLink 
                to="/signup" 
                icon={<FiUserPlus />} 
                text="Sign Up" 
                isPrimary 
              />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// Reusable NavLink component for desktop
const NavLink = ({ to, icon, text, isPrimary = false }) => (
  <Link
    to={to}
    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isPrimary 
        ? 'bg-blue-200 text-blue-800 hover:bg-blue-300 shadow-md hover:shadow-lg dark:bg-blue-700 dark:text-white dark:hover:bg-blue-600' 
        : 'text-blue-100 hover:bg-blue-700/30 hover:text-white dark:text-gray-300 dark:hover:bg-gray-700/30 dark:hover:text-white'
    }`}
  >
    <span className="text-lg">{icon}</span>
    <span>{text}</span>
  </Link>
);

// Mobile NavLink component with larger touch targets
const MobileNavLink = ({ to, icon, text, isPrimary = false }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-md text-base font-medium transition-colors ${
      isPrimary 
        ? 'bg-blue-200 text-blue-800 justify-center dark:bg-blue-700 dark:text-white' 
        : 'text-blue-100 hover:bg-blue-700/30 hover:text-white dark:text-gray-300 dark:hover:bg-gray-700/30 dark:hover:text-white'
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span>{text}</span>
  </Link>
);

export default Navbar;