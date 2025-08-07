import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/LoginPage";
import Signup from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import SettingsPage from "./pages/SettingsPage";
import IncomeRecords from "./pages/IncomeRecords";
import { Toaster } from "react-hot-toast";
function App() {
  return (
    <Router>
      <div className="w-full min-h-screen bg-gray-100">
        <Navbar />
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<Home />} />
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