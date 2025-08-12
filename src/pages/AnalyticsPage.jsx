import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useProStatus } from "../hooks/useProStatus";
import { FiBarChart2, FiTrendingUp, FiDollarSign, FiClock } from "react-icons/fi";

function AnalyticsPage() {
  const { currentUser } = useAuth();
  const isPro = useProStatus();
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    totalEarnings: 0,
    monthlyGrowth: 0,
    topPlatform: 'N/A',
    hoursWorked: 0
  });

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setAnalyticsData({
        totalEarnings: 2450,
        monthlyGrowth: 15.8,
        topPlatform: 'Upwork',
        hoursWorked: 128
      });
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isPro) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Upgrade to Pro</h2>
          <p className="text-gray-600 mb-6">Advanced Analytics are only available for Pro users.</p>
          <a
            href="https://trackmyincome.lemonsqueezy.com/buy/fc8795bb-8bc2-483e-badf-a2b2afcfdd30"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium py-2.5 px-6 rounded-lg hover:opacity-90 transition-opacity"
          >
            <span>Upgrade Now</span>
            <span className="text-xs bg-yellow-700 text-yellow-100 px-2 py-0.5 rounded-full">
              $9/month
            </span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your freelancing performance and growth</p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-sm p-6 h-32 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              icon={<FiDollarSign className="w-6 h-6 text-green-500" />}
              title="Total Earnings"
              value={`$${analyticsData.totalEarnings.toLocaleString()}`}
              change={analyticsData.monthlyGrowth}
              isCurrency={true}
            />
            <StatCard 
              icon={<FiTrendingUp className="w-6 h-6 text-blue-500" />}
              title="Monthly Growth"
              value={`${analyticsData.monthlyGrowth}%`}
              isPositive={analyticsData.monthlyGrowth >= 0}
            />
            <StatCard 
              icon={<FiBarChart2 className="w-6 h-6 text-purple-500" />}
              title="Top Platform"
              value={analyticsData.topPlatform}
            />
            <StatCard 
              icon={<FiClock className="w-6 h-6 text-amber-500" />}
              title="Hours Worked"
              value={analyticsData.hoursWorked.toLocaleString()}
              description="this month"
            />
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Earnings Overview</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Earnings chart will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, change, isPositive, isCurrency = false, description }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="p-2 bg-gray-50 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {change !== undefined && (
          <span className={`ml-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
  );
}

export default AnalyticsPage;
