import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import IncomeForm from "../components/IncomeForm";
import IncomeList from "../components/IncomeList";
import AnalyticsSummary from "../components/AnalyticsSummary";
import IncomeChart from "../components/IncomeChart";
import IncomePieChart from "../components/IncomePieChart";
import PlatformTrendsTable from "../components/PlatformTrendsTable";

function Dashboard() {
  const { currentUser } = useAuth();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-4">Welcome, {currentUser?.name}</h2>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? "Close Form" : "Add Income"}
        </button>

        {showForm && <IncomeForm />}

        <AnalyticsSummary />
        <IncomeChart />
        <PlatformTrendsTable />
        <IncomePieChart/>
        <IncomeList />
      </div>
    </div>
  );
}

export default Dashboard;
