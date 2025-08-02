import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

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
      const byPlatform = incomes.reduce(
        (acc, income) => ({
          ...acc,
          [income.platform]: (acc[income.platform] || 0) + income.amount,
        }),
        { Fiverr: 0, Upwork: 0, Other: 0 }
      );

      setSummary({ totalIncome, averageIncome, byPlatform });
    });

    return unsubscribe;
  }, [currentUser]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-bold mb-4">Income Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-100 rounded-lg">
          <h4 className="text-gray-700">Total Income</h4>
          <p className="text-2xl font-bold">${summary.totalIncome.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-green-100 rounded-lg">
          <h4 className="text-gray-700">Average Income</h4>
          <p className="text-2xl font-bold">${summary.averageIncome.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-purple-100 rounded-lg">
          <h4 className="text-gray-700">By Platform</h4>
          <ul>
            <li>Fiverr: ${summary.byPlatform.Fiverr.toFixed(2)}</li>
            <li>Upwork: ${summary.byPlatform.Upwork.toFixed(2)}</li>
            <li>Other: ${summary.byPlatform.Other.toFixed(2)}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsSummary;