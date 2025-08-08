import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { FiTrendingUp, FiDollarSign, FiCalendar } from "react-icons/fi";
import { format } from "date-fns";

function PlatformTrendsTable() {
  const { currentUser } = useAuth();
  const [data, setData] = useState({ platforms: [], rows: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "incomes"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLoading(true);
      const incomes = snapshot.docs.map((doc) => doc.data());

      // Group by month + platform
      const monthPlatformTotals = {};
      const platformColors = {}; // Store color for each platform

      incomes.forEach((income) => {
        const date = new Date(income.date);
        const month = format(date, "MMM yyyy");
        const platform = income.platform || "Other";

        if (!monthPlatformTotals[month]) {
          monthPlatformTotals[month] = {};
        }

        monthPlatformTotals[month][platform] = 
          (monthPlatformTotals[month][platform] || 0) + income.amount;
        
        // Assign a color if not already assigned
        if (!platformColors[platform]) {
          // Generate a consistent color based on platform name
          platformColors[platform] = generatePlatformColor(platform);
        }
      });

      // Extract unique platforms and sorted months
      const months = Object.keys(monthPlatformTotals).sort(
        (a, b) => new Date(a) - new Date(b)
      );
      const platforms = Array.from(
        new Set(incomes.map((income) => income.platform || "Other"))
      ).sort();

      // Build rows
      const tableData = months.map((month) => {
        const row = { month };
        platforms.forEach((platform) => {
          row[platform] = monthPlatformTotals[month][platform] || 0;
        });
        return row;
      });

      setData({ platforms, rows: tableData, platformColors });
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  // Generate a consistent color based on platform name
  const generatePlatformColor = (platform) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-yellow-100 text-yellow-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
    ];
    const index = platform.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Format currency with commas
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FiTrendingUp className="text-2xl text-blue-500" />
          <h3 className="text-xl font-bold text-gray-800">Platform Earnings Trends</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FiCalendar className="text-gray-400" />
          <span>By Month</span>
        </div>
      </div>
      
      {!data?.rows?.length ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <FiDollarSign className="mx-auto text-3xl text-gray-400 mb-3" />
          <p className="text-gray-500">No income data available to show trends</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Platform Legend */}
          <div className="flex flex-wrap gap-2 mb-4">
            {data.platforms.map((platform) => (
              <div 
                key={platform} 
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${data.platformColors?.[platform] || 'bg-gray-100 text-gray-800'}`}
              >
                <div className="w-2 h-2 rounded-full bg-current opacity-70"></div>
                {platform}
              </div>
            ))}
          </div>

          {/* Responsive Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  {data.platforms.map((platform) => (
                    <th 
                      key={platform} 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {platform}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.rows.map((row) => (
                  <tr key={row.month} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                      {row.month}
                    </td>
                    {data.platforms.map((platform) => (
                      <td key={`${row.month}-${platform}`} className="px-4 py-3 whitespace-nowrap">
                        {row[platform] > 0 ? (
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {formatCurrency(row[platform])}
                            </span>
                            <div 
                              className={`w-2 h-2 rounded-full ${data.platformColors?.[platform]?.replace('bg-', 'bg-opacity-60 bg-').replace('text-', '')}`}
                              aria-hidden="true"
                            ></div>
                          </div>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Stats */}
          <div className="pt-4 mt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-600 font-medium">Total Platforms</p>
                <p className="text-lg font-bold text-blue-800">{data.platforms.length}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-green-600 font-medium">Months Tracked</p>
                <p className="text-lg font-bold text-green-800">{data.rows.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlatformTrendsTable;