import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
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
        }, {});

        const platformPercentages = {};
         Object.entries(byPlatform).forEach(([platform, amount]) => {
          platformPercentages[platform] = (amount / totalIncome) * 100;
        });

      setSummary({ totalIncome, averageIncome, byPlatform });
    });

    return unsubscribe;
  }, [currentUser]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SummaryCard title="Total Income" bg="bg-blue-100">
        ${summary.totalIncome.toFixed(2)}
      </SummaryCard>
      <SummaryCard title="Average Income" bg="bg-green-100">
        ${summary.averageIncome.toFixed(2)}
      </SummaryCard>
      <SummaryCard title="By Platform" bg="bg-purple-100">
        <ul>
          {Object.entries(summary.byPlatform).map(([platform, amount]) => {
            const percent = (amount / summary.totalIncome) * 100;
            return (
              <li key={platform}>
                {platform}: ${amount.toFixed(2)} ({percent.toFixed(1)}%)
              </li>
            );
          })}
        </ul>
      </SummaryCard>
    </div>
  );
}

export default AnalyticsSummary;