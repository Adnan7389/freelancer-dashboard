import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

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
    <div className="bg-white p-6 rounded-lg shadow-md mb-6 overflow-x-auto">
      <h3 className="text-lg font-bold mb-4">Platform Trends by Month</h3>
      <table className="min-w-full table-auto">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-2">Month</th>
            {data.platforms.map((platform) => (
              <th key={platform} className="p-2">
                {platform}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row) => (
            <tr key={row.month} className="border-t">
              <td className="p-2 font-medium">{row.month}</td>
              {data.platforms.map((platform) => (
                <td key={platform} className="p-2">
                  {row[platform] > 0 ? `$${row[platform].toFixed(2)}` : "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PlatformTrendsTable;
