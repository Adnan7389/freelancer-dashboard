import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import SummaryCard from "./SummaryCard";

function AnalyticsSummary() {
  const { currentUser } = useAuth();
  const [summary, setSummary] = useState({
    totalIncome: 0,
    averageIncome: 0,
    byPlatform: { Fiverr: 0, Upwork: 0, Other: 0 },
  });

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "incomes"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const incomes = snapshot.docs.map((doc) => doc.data());
      const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
      const averageIncome = incomes.length ? totalIncome / incomes.length : 0;
      const byPlatform = incomes.reduce((acc, income) => {
        acc[income.platform] = (acc[income.platform] || 0) + income.amount;
        return acc;
      }, { Fiverr: 0, Upwork: 0, Other: 0 });

      setSummary({ totalIncome, averageIncome, byPlatform });
    });

    return unsubscribe;
  }, [currentUser]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
      <SummaryCard title="Total Income" bg="bg-blue-50">
        <div className="text-gray-800 text-xl md:text-2xl font-semibold">
          ${summary.totalIncome.toFixed(2)}
        </div>
      </SummaryCard>

      <SummaryCard title="Average Income" bg="bg-green-50">
        <div className="text-gray-800 text-xl md:text-2xl font-semibold">
          ${summary.averageIncome.toFixed(2)}
        </div>
      </SummaryCard>

      <SummaryCard title="By Platform" bg="bg-purple-50">
        <ul className="space-y-1 text-sm text-gray-700">
          {Object.entries(summary.byPlatform).map(([platform, amount]) => {
            const percent = (amount / summary.totalIncome) * 100 || 0;
            return (
              <li key={platform} className="flex justify-between">
                <span>{platform}</span>
                <span className="text-right font-medium text-gray-800">
                  ${amount.toFixed(2)}{" "}
                  <span className="text-gray-500 text-xs">
                    ({percent.toFixed(1)}%)
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </SummaryCard>
    </div>
  );
}

export default AnalyticsSummary;
