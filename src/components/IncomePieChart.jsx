import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { FiPieChart, FiDollarSign, FiLoader } from "react-icons/fi";
import { useMediaQuery } from "react-responsive";

ChartJS.register(ArcElement, Tooltip, Legend);

function IncomePieChart() {
  const { currentUser } = useAuth();
  const [platformData, setPlatformData] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

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
        setPlatformData(null);
        setLoading(false);
        return;
      }

      const platformTotals = incomes.reduce((acc, income) => {
        const platform = income.platform || "Other";
        acc[platform] = (acc[platform] || 0) + income.amount;
        return acc;
      }, {});

      // Sort platforms by amount (descending)
      const sortedEntries = Object.entries(platformTotals)
        .sort((a, b) => b[1] - a[1]);

      const labels = sortedEntries.map(([platform]) => platform);
      const data = sortedEntries.map(([_, amount]) => amount);

      // Generate consistent colors based on platform names
      const platformColors = labels.map(platform => {
        const colors = [
          '#3B82F6', // blue-500
          '#10B981', // emerald-500
          '#F59E0B', // amber-500
          '#EF4444', // red-500
          '#8B5CF6', // violet-500
          '#EC4899', // pink-500
          '#14B8A6', // teal-500
          '#F97316', // orange-500
        ];
        const index = platform.charCodeAt(0) % colors.length;
        return colors[index];
      });

      setPlatformData({
        labels,
        datasets: [{
          label: "Income by Platform",
          data,
          backgroundColor: platformColors,
          borderColor: '#fff',
          borderWidth: 2,
          hoverBorderColor: '#fff',
          hoverOffset: 10
        }],
      });
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FiPieChart className="text-2xl text-blue-500" />
          <h3 className="text-xl font-bold text-gray-800">Income Distribution</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FiDollarSign className="text-gray-400" />
          <span>By Platform</span>
        </div>
      </div>
      
      {loading ? (
        <div className="h-64 md:h-80 flex items-center justify-center">
          <FiLoader className="animate-spin text-gray-400 text-2xl" />
        </div>
      ) : !platformData ? (
        <div className="h-64 md:h-80 flex flex-col items-center justify-center text-center">
          <FiDollarSign className="text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500">No income data available</p>
          <p className="text-sm text-gray-400 mt-1">Add income records to see platform distribution</p>
        </div>
      ) : (
        <div className="h-64 md:h-80">
          <Pie
            data={platformData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { 
                  position: isMobile ? "bottom" : "right",
                  labels: {
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: "circle",
                    font: {
                      family: "'Inter', sans-serif"
                    },
                    generateLabels: (chart) => {
                      const data = chart.data;
                      if (data.labels.length && data.datasets.length) {
                        return data.labels.map((label, i) => {
                          const value = data.datasets[0].data[i];
                          const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                          const percentage = Math.round((value / total) * 100);
                          
                          return {
                            text: `${label} (${percentage}%)`,
                            fillStyle: data.datasets[0].backgroundColor[i],
                            hidden: false,
                            lineWidth: 0,
                            strokeStyle: 'transparent',
                            pointStyle: 'circle'
                          };
                        });
                      }
                      return [];
                    }
                  }
                },
                tooltip: {
                  displayColors: false,
                  backgroundColor: '#1F2937',
                  titleFont: {
                    size: 14,
                    weight: 'bold'
                  },
                  bodyFont: {
                    size: 13
                  },
                  callbacks: {
                    label: function(context) {
                      const label = context.label || '';
                      const value = context.raw;
                      const total = context.chart._metasets[0].total;
                      const percent = ((value / total) * 100).toFixed(1);
                      return `${label}: ${formatCurrency(value)} (${percent}%)`;
                    },
                    title: function() {
                      return ''; // Remove title
                    }
                  }
                },
              },
              cutout: isMobile ? '50%' : '60%',
              animation: {
                animateScale: true,
                animateRotate: true
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

export default IncomePieChart;