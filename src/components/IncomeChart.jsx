import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
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
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function IncomeChart() {
  const { currentUser } = useAuth();
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

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

      const dates = [...new Set(incomes.map((income) => income.date))];
      const data = dates.map((date) =>
        incomes
          .filter((income) => income.date === date)
          .reduce((sum, income) => sum + income.amount, 0)
      );

      setChartData({
        labels: dates.map((date) => new Date(date).toLocaleDateString()),
        datasets: [
          {
            label: "Income Over Time",
            data,
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            fill: true,
          },
        ],
      });
    });

    return unsubscribe;
  }, [currentUser]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-bold mb-4">Income Over Time</h3>
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