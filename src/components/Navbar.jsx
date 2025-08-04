import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";


function Navbar() {
  const { currentUser } = useAuth();

  return (
    <nav className="bg-blue-700 p-4 text-white shadow-md">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <Link 
          to="/" 
          className="text-xl font-bold hover:text-blue-100 transition-colors"
        >
          Freelancer Dashboard
        </Link>
        
        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              <span className="hidden sm:inline text-blue-100">
                Hello, {currentUser.name}
              </span>
              
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="hover:text-blue-100 transition-colors px-3 py-1 rounded hover:bg-blue-600"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;