import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function IncomeChart() {
  const { currentUser } = useAuth();
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [groupBy, setGroupBy] = useState("daily"); // "daily" | "weekly" | "monthly"

  function groupIncomes(incomes, groupBy) {
  const grouped = {};

  incomes.forEach((income) => {
    const date = new Date(income.date);
    let key;

    if (groupBy === "daily") {
      key = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else if (groupBy === "weekly") {
      // Week starting on Monday
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay() + 1);
      key = startOfWeek.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else if (groupBy === "monthly") {
      key = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    }

    grouped[key] = (grouped[key] || 0) + income.amount;
  });

  // Return sorted arrays
  const sortedKeys = Object.keys(grouped).sort(
    (a, b) => new Date(a) - new Date(b)
  );
  return {
    labels: sortedKeys,
    data: sortedKeys.map((key) => grouped[key]),
  };
}

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "incomes"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const incomes = snapshot.docs
        .map((doc) => doc.data())
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      const grouped = groupIncomes(incomes, groupBy);
       setChartData({
         labels: grouped.labels,
         datasets: [
           {
             label: `Income (${groupBy})`,
             data: grouped.data,
             borderColor: "rgb(59, 130, 246)",
             backgroundColor: "rgba(59, 130, 246, 0.2)",
             fill: true,
           },
         ],
       });
    });

    return unsubscribe;
  }, [currentUser, groupBy]);

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
  <h3 className="text-lg font-bold text-gray-800">Income Trend</h3>
  <div className="flex items-center">
    <label htmlFor="groupBy" className="mr-2 text-sm font-medium text-gray-700">Group By:</label>
    <select
      id="groupBy"
      value={groupBy}
      onChange={(e) => setGroupBy(e.target.value)}
      className="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="daily">Daily</option>
      <option value="weekly">Weekly</option>
      <option value="monthly">Monthly</option>
    </select>
  </div>
</div>

      
      <div className="h-64 md:h-80">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "top" },
              tooltip: {
                mode: "index",
                intersect: false,
              },
            },
            interaction: {
              mode: "nearest",
              axis: "x",
              intersect: false,
            },
            scales: {
              y: { 
                beginAtZero: true,
                grid: { color: "rgba(0, 0, 0, 0.05)" },
                ticks: { 
                  callback: (value) => `$${value}` 
                }
              },
              x: { 
                grid: { display: false },
              },
            },
          }}
        />
      </div>
    </div>
  );
}

export default IncomeChart;