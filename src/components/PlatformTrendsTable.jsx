import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";

function PlatformTrendsTable() {
  const { currentUser } = useAuth();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "incomes"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const incomes = snapshot.docs.map((doc) => doc.data());

      // Step 1: Group by month + platform
      const monthPlatformTotals = {}; // { "Apr 2025": { Fiverr: 100, Upwork: 50 } }

      incomes.forEach((income) => {
        const date = new Date(income.date);
        const month = date.toLocaleString("en-US", { month: "short", year: "numeric" });
        const platform = income.platform;

        if (!monthPlatformTotals[month]) {
          monthPlatformTotals[month] = {};
        }

        monthPlatformTotals[month][platform] = (monthPlatformTotals[month][platform] || 0) + income.amount;
      });

      // Step 2: Extract unique platforms and sorted months
      const months = Object.keys(monthPlatformTotals).sort(
        (a, b) => new Date(a) - new Date(b)
      );
      const platforms = Array.from(
        new Set(incomes.map((income) => income.platform))
      );

      // Step 3: Build rows
      const tableData = months.map((month) => {
        const row = { month };
        platforms.forEach((platform) => {
          row[platform] = monthPlatformTotals[month][platform] || 0;
        });
        return row;
      });

      setData({ platforms, rows: tableData });
    });

    return unsubscribe;
  }, [currentUser]);

  if (!data?.rows?.length) {
    return <p className="text-gray-500">No income trends to display.</p>;
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Platform Trends by Month</h3>
      
      {!data?.rows?.length ? (
        <p className="text-gray-500 py-4 text-center">No income trends to display.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                {data.platforms.map((platform) => (
                  <th key={platform} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {platform}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.rows.map((row) => (
                <tr key={row.month} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                    {row.month}
                  </td>
                  {data.platforms.map((platform) => (
                    <td key={platform} className="px-4 py-3 whitespace-nowrap">
                      {row[platform] > 0 ? (
                        <span className="font-medium">${row[platform].toFixed(2)}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PlatformTrendsTable;
