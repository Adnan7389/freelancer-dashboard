import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingNavbar from "./components/LandingNavbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/LoginPage";
import Signup from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import SettingsPage from "./pages/SettingsPage";
import IncomeRecords from "./pages/IncomeRecords";
import AboutPage from "./pages/AboutPage";
import { Toaster } from "react-hot-toast";

function NavbarWrapper() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  
  return isLandingPage ? <LandingNavbar /> : <Navbar />;
}

function App() {
  return (
    <Router>
      <div className="w-full min-h-screen bg-gray-100">
        <NavbarWrapper />
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
         />
         <Route path="/income-records" element={<ProtectedRoute><IncomeRecords /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;