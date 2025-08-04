import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";

import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function IncomePieChart() {
  const { currentUser } = useAuth();
  const [platformData, setPlatformData] = useState({
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
      const incomes = snapshot.docs.map((doc) => doc.data());

      const platformTotals = incomes.reduce((acc, income) => {
        acc[income.platform] = (acc[income.platform] || 0) + income.amount;
        return acc;
      }, {});

      const labels = Object.keys(platformTotals);
      const data = Object.values(platformTotals);

      setPlatformData({
        labels,
        datasets: [
          {
            label: "Income by Platform",
            data,
            backgroundColor: [
              "#3B82F6", // blue
              "#10B981", // green
              "#F59E0B", // amber
              "#EF4444", // red
              "#8B5CF6", // violet
            ],
            borderColor: "#fff",
            borderWidth: 1,
          },
        ],
      });
    });

    return unsubscribe;
  }, [currentUser]);

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Income by Platform</h3>
      </div>
      
      <div className="h-64 md:h-80">
        <Pie
          data={platformData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { 
                position: window.innerWidth < 768 ? "bottom" : "right",
                labels: {
                  padding: 20,
                  usePointStyle: true,
                  pointStyle: "circle"
                }
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const value = context.raw;
                    const total = context.chart._metasets[0].total;
                    const percent = ((value / total) * 100).toFixed(1);
                    return `${context.label}: $${value.toFixed(2)} (${percent}%)`;
                  },
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}

export default IncomePieChart;
