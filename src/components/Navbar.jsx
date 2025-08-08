import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import { FiUser, FiLogIn, FiUserPlus, FiHome } from "react-icons/fi";

function Navbar() {
  const { currentUser } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Logo & Branding */}
        <Link 
          to="/dashboard" 
          className="flex items-center gap-3 group"
          aria-label="Dashboard Home"
        >
          <Logo size={40} className="group-hover:scale-105 transition-transform" />
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-white hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-blue-300">
            Freelancer Analytics
          </span>
        </Link>
        
        {/* Navigation Links */}
        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              <div className="hidden sm:flex items-center gap-2 bg-blue-700/30 px-4 py-2 rounded-full border border-blue-400/20">
                <FiUser className="text-blue-200" />
                <span className="text-blue-100 font-medium">
                  {/* Hello, {currentUser.name} */}
                  My Account
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                to="/" 
                className="flex items-center gap-1.5 text-blue-100 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-500/30 group"
                aria-label="Home"
              >
                <FiHome className="group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <Link 
                to="/login" 
                className="flex items-center gap-1.5 text-blue-100 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-blue-500/30 group"
                aria-label="Login"
              >
                <FiLogIn className="group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Login</span>
              </Link>
              <Link 
                to="/signup" 
                className="flex items-center gap-1.5 bg-blue-200 hover:bg-blue-400 px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-[1.02] group"
                aria-label="Sign Up"
              >
                <FiUserPlus className="group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;