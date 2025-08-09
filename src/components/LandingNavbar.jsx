import { Link } from 'react-router-dom';

export default function LandingNavbar() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
            FA
          </div>
          <span className="text-xl font-bold text-gray-900">Freelancer Analytics</span>
        </div>
        <nav className="hidden md:flex space-x-8">
          <Link to="/features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</Link>
          <Link to="/pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</Link>
          <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About</Link>
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
