import { FiPlus, FiSettings, FiLogOut, FiUser } from "react-icons/fi";
import { Link} from "react-router-dom";
import { FaMoneyBillWave } from "react-icons/fa";

function Sidebar({ currentUser, showForm, setShowForm, sidebarOpen, setSidebarOpen, onLogout }) {
  return (
    <div className={`sidebar ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 w-72 bg-white shadow-xl lg:shadow-none z-20 transition-transform duration-300 ease-in-out`}>
  <div className="h-full flex flex-col p-4 space-y-6">
    
    {/* Header */}
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Welcome, {currentUser?.name}</h2>
    </div>

    {/* Main navigation links */}
    <div className="space-y-2">
      <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100">
        <FaMoneyBillWave className="text-blue-600" />
        Dashboard
      </Link>
      {/* Future features */}
      <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100">
        <FiUser size={20} />
        Clients (soon)
      </button>
    </div>

    {/* Action buttons */}
    <div>
      <button
        onClick={() => {
          setShowForm(true);
          if (window.innerWidth < 948) setSidebarOpen(false);
        }}
        className="w-full flex items-center gap-3 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <FiPlus size={20} />
        Add Income
      </button>
    </div>

    {/* Settings + Logout */}
    <div className="mt-auto space-y-2 border-t pt-4">
      <button className="w-full flex items-center gap-3 text-gray-700 hover:bg-gray-100 px-4 py-2.5 rounded-lg">
        <FiSettings size={20} />
        Settings
      </button>
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 text-gray-700 hover:bg-gray-100 px-4 py-2.5 rounded-lg"
      >
        <FiLogOut size={20} />
        Logout
      </button>
    </div>
  </div>
</div>

  );
}

export default Sidebar;
