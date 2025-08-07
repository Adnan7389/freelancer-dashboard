import { useNavigate } from "react-router-dom";
import IncomeList from "../components/IncomeList";
import { FiArrowLeft } from "react-icons/fi";

function IncomeRecords() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-blue-600 hover:underline"
        >
          <FiArrowLeft /> Back to Dashboard
        </button>
      </div>
      <IncomeList />
    </div>
  );
}

export default IncomeRecords;
