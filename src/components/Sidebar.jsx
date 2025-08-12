import { FiPlus, FiSettings, FiLogOut, FiUser, FiHome, FiTrendingUp, FiPieChart, FiDownload } from "react-icons/fi";
import { FaMoneyBillWave } from "react-icons/fa";
import { Link } from "react-router-dom";

function Sidebar({ currentUser, sidebarOpen, onLogout }) {
  return (
    <div className={`
      fixed lg:static inset-y-0 left-0 w-72 bg-white border-r border-gray-100
      transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
      lg:translate-x-0 z-20 transition-transform duration-300 ease-in-out
      flex flex-col
    `}>
      <div className="h-full flex flex-col p-4 space-y-6 overflow-y-auto">
        
        {/* User Profile Section */}
        <div className="px-2 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FiUser className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-medium text-gray-800">{currentUser?.name || "User"}</h2>
              <p className="text-xs text-gray-500">{currentUser?.email || "user@example.com"}</p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors group"
          >
            <FiHome className="text-gray-500 group-hover:text-blue-600" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/income-records"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors group"
          >
            <FaMoneyBillWave className="text-gray-500 group-hover:text-blue-600" />
            <span>Income Records</span>
          </Link>

          <Link
            to="/analytics"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors group"
          >
            <FiTrendingUp className="text-gray-500 group-hover:text-blue-600" />
            <span>Analytics</span>
          </Link>

          <Link
            to="/income-tools"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors group"
          >
            <FiDownload className="text-gray-500 group-hover:text-blue-600" />
            <span>Data Tools</span>
          </Link>

          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mt-6 mb-2 px-3">
            Coming Soon
          </div>

          <button 
            disabled
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 cursor-not-allowed w-full"
          >
            <FiUser className="text-gray-300" />
            <span>Clients</span>
            <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              Soon
            </span>
          </button>
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto space-y-2 border-t border-gray-100 pt-4">
          <Link
            to="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors group"
          >
            <FiSettings className="text-gray-500 group-hover:text-blue-600" />
            <span>Settings</span>
          </Link>

          <Link
            to="/legal"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors group text-sm"
          >
            <span className="ml-1">Legal</span>
          </Link>

          <a
            href="https://trackmyincome.lemonsqueezy.com/buy/fc8795bb-8bc2-483e-badf-a2b2afcfdd30"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-2 mt-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity"
          >
            <span className="flex items-center gap-2">
              <FiPlus />
              Upgrade to Pro
            </span>
            <span className="text-xs bg-yellow-700 text-yellow-100 px-2 py-0.5 rounded-full">
              $9/month
            </span>
          </a>

          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors group mt-2"
          >
            <FiLogOut className="text-gray-500 group-hover:text-red-500" />
            <span className="text-red-500 group-hover:text-red-600">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;