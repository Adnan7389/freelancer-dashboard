import { useAuth } from "../context/AuthContext";
import IncomeForm from "../components/IncomeForm";
import IncomeList from "../components/IncomeList";
import AnalyticsSummary from "../components/AnalyticsSummary";
import IncomeChart from "../components/IncomeChart";

function Dashboard() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-4">Welcome, {currentUser?.email}</h2>
      <p>This is your Freelancer Dashboard.</p>
      <div className="max-w-2xl mx-auto">
        <AnalyticsSummary />
        <IncomeChart />
        <IncomeForm />
        <IncomeList />
      </div>
    </div>
  );
}

export default Dashboard;
