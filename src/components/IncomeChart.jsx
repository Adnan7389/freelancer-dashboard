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
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="mb-4">
         <label className="mr-2 font-medium text-gray-700">Group By:</label>
         <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="p-2 border rounded"
         >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
         </select>
      </div>
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Daily Income Trend" },
          },
          scales: {
            y: { beginAtZero: true, title: { display: true, text: "Amount ($)" } },
            x: { title: { display: true, text: "Date" } },
          },
        }}
      />
    </div>
  );
}

export default IncomeChart;