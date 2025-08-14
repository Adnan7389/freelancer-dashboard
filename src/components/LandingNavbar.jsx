import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

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

export default function LandingNavbar() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  // If we're not on the home page, these will be regular links
  // If we are on the home page, they'll scroll to sections
  const navItems = [
    { id: 'features', label: 'Features' },
    { path: '/pricing', label: 'Pricing' },
    { id: 'about', label: 'About' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
            FA
          </div>
          <span className="text-xl font-bold text-gray-900">Freelancer Analytics</span>
        </Link>
        <nav className="hidden md:flex space-x-8">
          {navItems.map((item) => (
            <Link 
              key={item.id || item.path}
              to={item.path || (isHomePage ? '#' : `/#${item.id}`)}
              onClick={(e) => item.id && isHomePage && scrollToSection(e, item.id)}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center space-x-4">
          <Link 
            to="/login" 
            className="text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Log in
          </Link>
          <Link 
            to="/signup" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
