import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import SummaryCard from "./SummaryCard";
import { FiDollarSign, FiTrendingUp, FiPieChart, FiLoader } from "react-icons/fi";
import { format } from "date-fns";
import { useTheme } from "../hooks/useTheme"; // Import useTheme hook

function AnalyticsSummary() {
  const { currentUser } = useAuth();
  const { theme } = useTheme(); // Get the current theme
  const [summary, setSummary] = useState({
    totalIncome: 0,
    averageIncome: 0,
    byPlatform: {},
    lastUpdated: null
  });
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
      
      if (incomes.length === 0) {
        setSummary({
          totalIncome: 0,
          averageIncome: 0,
          byPlatform: {},
          lastUpdated: new Date()
        });
        setLoading(false);
        return;
      }

      const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
      const averageIncome = incomes.length ? totalIncome / incomes.length : 0;
      
      // Group by platform (case-insensitive) and use displayPlatform when available
      const platformMap = new Map();
      
      incomes.forEach(income => {
        const platformName = income.displayPlatform || income.platform || "Other";
        const platformKey = platformName.toLowerCase();
        
        // If we already have this platform (case-insensitive), use the existing display name
        if (platformMap.has(platformKey)) {
          const existing = platformMap.get(platformKey);
          platformMap.set(platformKey, {
            displayName: existing.displayName, // Keep the first display name we saw
            amount: existing.amount + income.amount
          });
        } else {
          platformMap.set(platformKey, {
            displayName: platformName, // Store the display name with original case
            amount: income.amount
          });
        }
      });

      // Convert to object with display names as keys
      const byPlatform = {};
      platformMap.forEach((value, key) => {
        byPlatform[value.displayName] = value.amount;
      });

      // Sort platforms by amount (descending)
      const sortedPlatforms = Object.entries(byPlatform)
        .sort((a, b) => b[1] - a[1])
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});

      setSummary({
        totalIncome,
        averageIncome,
        byPlatform: sortedPlatforms,
        lastUpdated: new Date()
      });
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {[1, 2, 3].map((i) => (
          <SummaryCard 
            key={i} 
            title="Loading..." 
            bg="bg-gray-50 dark:bg-gray-800"
          >
            <div className="flex justify-center py-6">
              <FiLoader className="animate-spin text-gray-400 dark:text-gray-500 text-2xl" />
            </div>
          </SummaryCard>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
      <SummaryCard 
        title="Total Income" 
        icon={<FiDollarSign className="text-blue-500" />}
        bg="bg-blue-50 dark:bg-blue-900/30"
        footer={`Updated ${format(summary.lastUpdated || new Date(), 'MMM d, h:mm a')}`}
      >
        <div className="text-3xl font-bold text-gray-800 dark:text-white py-2">
          {formatCurrency(summary.totalIncome)}
        </div>
        <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-1">
          All-time earnings
        </div>
      </SummaryCard>

      <SummaryCard 
        title="Average Income" 
        icon={<FiTrendingUp className="text-green-500" />}
        bg="bg-green-50 dark:bg-green-900/30"
      >
        <div className="text-3xl font-bold text-gray-800 dark:text-white py-2">
          {formatCurrency(summary.averageIncome)}
        </div>
        <div className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
          Per project/entry
        </div>
      </SummaryCard>

      <SummaryCard 
        title="By Platform" 
        icon={<FiPieChart className="text-purple-500" />}
        bg="bg-purple-50 dark:bg-purple-900/30"
      >
        <ul className="space-y-3">
          {Object.entries(summary.byPlatform).map(([platform, amount]) => {
            const percent = summary.totalIncome > 0 
              ? (amount / summary.totalIncome) * 100 
              : 0;
            
            return (
              <li key={platform}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{platform}</span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 dark:bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {percent.toFixed(1)}%
                </div>
              </li>
            );
          })}
        </ul>
      </SummaryCard>
    </div>
  );
}

export default AnalyticsSummary;