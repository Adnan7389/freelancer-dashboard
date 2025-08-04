import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import IncomeForm from "../components/IncomeForm";
import IncomeList from "../components/IncomeList";
import AnalyticsSummary from "../components/AnalyticsSummary";
import IncomeChart from "../components/IncomeChart";
import IncomePieChart from "../components/IncomePieChart";
import PlatformTrendsTable from "../components/PlatformTrendsTable";
import {
  FiMenu,
  FiX,
  FiPlus,
  FiSettings,
  FiLogOut,
  FiUser,
} from "react-icons/fi";

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
      <div
        className={`sidebar ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 w-72 bg-white shadow-xl lg:shadow-none z-20 transition-transform duration-300 ease-in-out`}
      >
        <div className="h-full p-4 overflow-y-auto flex flex-col">
          <h2 className="text-xl font-bold mb-6 text-gray-800 p-2 hidden lg:block">
            Welcome, {currentUser?.name}
          </h2>

          <div className="space-y-4 flex-grow">
            <button
              onClick={() => {
                setShowForm(true);
                if (window.innerWidth < 948) setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <FiPlus size={20} />
              Add Income
            </button>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-200 space-y-2">
            <button className="w-full flex items-center gap-3 text-gray-700 hover:bg-gray-100 px-4 py-2.5 rounded-lg transition-colors">
              <FiUser size={20} />
              Clients (future)
            </button>
            <button className="w-full flex items-center gap-3 text-gray-700 hover:bg-gray-100 px-4 py-2.5 rounded-lg transition-colors">
              <FiSettings size={20} />
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 text-gray-700 hover:bg-gray-100 px-4 py-2.5 rounded-lg transition-colors"
            >
              <FiLogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>

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
          <div className="border-t border-gray-200 pt-4">
            <AnalyticsSummary />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <IncomeChart />
            <IncomePieChart />
          </div>

          <PlatformTrendsTable />
          <IncomeList />
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
