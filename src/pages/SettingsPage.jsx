import Settings from "../components/Settings";
import { useAuth } from "../hooks/useAuth";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FiMenu, FiX } from "react-icons/fi";
import { useState, useEffect } from "react";

function SettingsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
      try {
        await signOut(auth);
        navigate("/login");
      } catch (err) {
        console.error("Logout failed:", err);
      }
    };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth < 1024) {
        const sidebar = document.querySelector(".sidebar");
        const toggleButton = document.querySelector(".sidebar-toggle");

        if (
          sidebar &&
          !sidebar.contains(event.target) &&
          toggleButton &&
          !toggleButton.contains(event.target)
        ) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="sidebar-toggle lg:hidden fixed bottom-6 right-6 z-30 bg-blue-600 text-white p-3 rounded-full shadow-xl hover:bg-blue-700 transition-all"
      >
        {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <Sidebar
        currentUser={currentUser}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-6">
        <Settings />
      </main>
    </div>
  );
}

export default SettingsPage;
