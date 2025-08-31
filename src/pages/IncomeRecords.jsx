import { useNavigate } from "react-router-dom";
import IncomeList from "../components/IncomeList";
import { FiArrowLeft } from "react-icons/fi";
import { useTheme } from "../hooks/useTheme";

function IncomeRecords() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className={`flex items-center gap-2 ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} hover:underline`}
        >
          <FiArrowLeft /> Back to Dashboard
        </button>
      </div>
      <IncomeList />
    </div>
  );
}

export default IncomeRecords;