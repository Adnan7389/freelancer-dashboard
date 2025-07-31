import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-4">Welcome, {currentUser?.email}</h2>
      <p>This is your Freelancer Dashboard.</p>
    </div>
  );
}

export default Dashboard;
