import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';

const scrollToSection = (e, sectionId) => {
  // Only prevent default if we're already on the home page
  if (window.location.pathname === '/') {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  // If not on home page, the Link will handle navigation
};

// NavItem component for better code organization
const NavItem = ({ item, isHomePage, isMobile = false, closeMenu }) => {
  return (
    <Link 
      to={item.path || (isHomePage ? '#' : `/#${item.id}`)}
      onClick={(e) => {
        if (item.id && isHomePage) {
          scrollToSection(e, item.id);
        }
        if (closeMenu) closeMenu();
      }}
      className={`${
        isMobile 
          ? 'block px-4 py-3 text-lg text-gray-700 hover:bg-blue-50 rounded-lg transition-colors' 
          : 'text-gray-600 hover:text-blue-600 transition-colors'
      }`}
    >
      {item.label}
    </Link>
  );
};

export default function LandingNavbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isHomePage = location.pathname === '/';
  
  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);
  
  // Disable body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);
  
  const navItems = [
    { id: 'features', label: 'Features' },
    { path: '/pricing', label: 'Pricing' },
    { id: 'about', label: 'About' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                FA
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:inline">
                Freelancer Analytics
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <NavItem 
                key={item.id || item.path} 
                item={item} 
                isHomePage={isHomePage} 
              />
            ))}
          </nav>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Log in
            </Link>
            <Link 
              to="/signup" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-[1.02]"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
              aria-expanded="false"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? (
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
          isMenuOpen ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t border-gray-200">
          {navItems.map((item) => (
            <NavItem 
              key={item.id || item.path} 
              item={item} 
              isHomePage={isHomePage}
              isMobile={true}
              closeMenu={() => setIsMenuOpen(false)}
            />
          ))}
          <div className="pt-2 space-y-2">
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full text-center px-4 py-2.5 text-base font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full text-center px-4 py-2.5 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
