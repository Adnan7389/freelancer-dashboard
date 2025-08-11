import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import IncomeForm from "../components/IncomeForm";
import AnalyticsSummary from "../components/AnalyticsSummary";
import IncomeChart from "../components/IncomeChart";
import IncomePieChart from "../components/IncomePieChart";
import PlatformTrendsTable from "../components/PlatformTrendsTable";
import {
  FiMenu,
  FiX,
  FiPlus,
} from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import IncomeDataTools from "../components/IncomeDataTools";


function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Close sidebar on outside click
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
       showForm={showForm}
       setShowForm={setShowForm}
       sidebarOpen={sidebarOpen}
       setSidebarOpen={setSidebarOpen}
       onLogout={handleLogout}
     />

      {/* Main content */}
      <div className="flex-1 p-4 lg:p-6">
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome, {currentUser?.name}
          </h2>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <FiMenu size={24} />
          </button>
        </div>
        <div className="space-y-6">
          <button
           onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <FiPlus size={18} /> Add Income
          </button>       
          <div className="border-t border-gray-200 pt-4">
            <AnalyticsSummary />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <IncomeChart />
            <IncomePieChart />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <PlatformTrendsTable compact={true} />
            <IncomeDataTools />
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg relative max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b">
               <h3 className="text-lg font-semibold text-gray-800">Add New Income</h3>
              <button
                onClick={() => setShowForm(false)}
                 className="text-gray-500 hover:text-gray-700"
               >
                 <FiX size={22} />
               </button>
             </div>
      
            {/* Modal Body */}
             <div className="p-4">
               <IncomeForm onSuccess={() => setShowForm(false)} />
             </div>
      
             {/* Modal Footer */}
             <div className="sticky bottom-0 bg-white z-10 p-4 border-t">
              <button
                onClick={() => setShowForm(false)}
                className="w-full text-center text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
