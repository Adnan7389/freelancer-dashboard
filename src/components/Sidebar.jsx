import { FiPlus, FiSettings, FiLogOut, FiUser } from "react-icons/fi";
import { Link} from "react-router-dom";
import { FaMoneyBillWave } from "react-icons/fa";

function Sidebar({ currentUser,  sidebarOpen, onLogout }) {
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
      <Link
        to="/income-records"
        className="w-full flex items-center gap-3 text-gray-700 hover:bg-gray-100 px-4 py-2.5 rounded-lg transition-colors"
      >
        <span>📊</span> Income Records
      </Link>
    </div>
    {/* Settings + Logout */}
    <div className="mt-auto space-y-2 border-t pt-4">
      <Link
        to="/dashboard/settings"
        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
        >
        ⚙️ Settings
      </Link>
      <a
        href="https://trackmyincome.lemonsqueezy.com/buy/fc8795bb-8bc2-483e-badf-a2b2afcfdd30"
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-4 bg-yellow-500 text-white font-semibold py-2 px-4 rounded hover:bg-yellow-600 transition"
      >
        🚀 Upgrade to Pro
      </a>
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
