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
import { FiTrendingUp, FiCalendar, FiLoader } from "react-icons/fi";
import { format, startOfWeek, parseISO } from "date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function IncomeChart() {
  const { currentUser } = useAuth();
  const [chartData, setChartData] = useState(null);
  const [groupBy, setGroupBy] = useState("monthly"); // "daily" | "weekly" | "monthly"
  const [loading, setLoading] = useState(true);

  function groupIncomes(incomes, groupBy) {
    const grouped = {};

    incomes.forEach((income) => {
      const date = parseISO(income.date);
      let key;

      if (groupBy === "daily") {
        key = format(date, "MMM d");
      } else if (groupBy === "weekly") {
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        key = format(weekStart, "MMM d");
      } else {
        key = format(date, "MMM yyyy");
      }

      grouped[key] = (grouped[key] || 0) + income.amount;
    });

    // Return sorted arrays
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      return new Date(a) - new Date(b);
    });

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
      setLoading(true);
      const incomes = snapshot.docs.map((doc) => doc.data());

      if (incomes.length === 0) {
        setChartData(null);
        setLoading(false);
        return;
      }

      const grouped = groupIncomes(incomes, groupBy);
      
      setChartData({
        labels: grouped.labels,
        datasets: [
          {
            label: "Income",
            data: grouped.data,
            borderColor: "#3B82F6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: 2,
            pointBackgroundColor: "#3B82F6",
            pointBorderColor: "#fff",
            pointHoverRadius: 6,
            pointHoverBorderWidth: 2,
            tension: 0.3,
            fill: true,
          },
        ],
      });
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser, groupBy]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <FiTrendingUp className="text-2xl text-blue-500" />
          <h3 className="text-xl font-bold text-gray-800">Income Trend</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FiCalendar className="text-gray-400" />
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-64 md:h-80 flex items-center justify-center">
          <FiLoader className="animate-spin text-gray-400 text-2xl" />
        </div>
      ) : !chartData ? (
        <div className="h-64 md:h-80 flex flex-col items-center justify-center text-center">
          <FiTrendingUp className="text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500">No income data available</p>
          <p className="text-sm text-gray-400 mt-1">
            Add income records to see trends
          </p>
        </div>
      ) : (
        <div className="h-64 md:h-80">
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  backgroundColor: "#1F2937",
                  padding: 12,
                  displayColors: false,
                  callbacks: {
                    label: (context) => {
                      return `${formatCurrency(context.raw)}`;
                    },
                    title: (context) => {
                      return context[0].label;
                    },
                  },
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
                  grid: {
                    color: "rgba(0, 0, 0, 0.05)",
                    drawBorder: false,
                  },
                  ticks: {
                    callback: (value) => formatCurrency(value),
                    font: {
                      family: "'Inter', sans-serif",
                    },
                  },
                },
                x: {
                  grid: {
                    display: false,
                    drawBorder: false,
                  },
                  ticks: {
                    font: {
                      family: "'Inter', sans-serif",
                    },
                  },
                },
              },
              elements: {
                line: {
                  borderJoinStyle: "round",
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

export default IncomeChart;