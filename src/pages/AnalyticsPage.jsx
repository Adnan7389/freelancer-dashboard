import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useProStatus } from "../hooks/useProStatus";
import { db } from "../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { 
  FiTrendingUp, 
  FiDollarSign,
  FiUsers,
  FiZap,
  FiAward,
  FiCalendar,
  FiPieChart,
  FiTarget
} from "react-icons/fi";

// Helper functions for data processing
const calculatePlatformComparison = (incomes) => {
  const platforms = {};
  incomes.forEach(income => {
    if (income.platform) {
      const platformName = income.platform.toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      platforms[platformName] = (platforms[platformName] || 0) + (Number(income.amount) || 0);
    }
  });
  return platforms;
};

const calculateMonthlyGrowth = (incomes) => {
  const monthlyData = {};
  
  incomes.forEach(income => {
    if (income.date) {
      const date = income.date.toDate ? income.date.toDate() : new Date(income.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0;
      }
      monthlyData[monthYear] += parseFloat(income.amount) || 0;
    }
  });
  
  const sortedMonths = Object.keys(monthlyData).sort();
  if (sortedMonths.length < 2) return 0;
  
  const currentMonth = sortedMonths[sortedMonths.length - 1];
  const previousMonth = sortedMonths[sortedMonths.length - 2];
  const currentAmount = monthlyData[currentMonth];
  const previousAmount = monthlyData[previousMonth];
  
  if (previousAmount === 0) return currentAmount > 0 ? 100 : 0;
  return ((currentAmount - previousAmount) / previousAmount) * 100;
};

const calculateSeasonalPatterns = (incomes) => {
  const monthlyTotals = Array(12).fill(0);
  const monthlyCounts = Array(12).fill(0);
  
  incomes.forEach(income => {
    if (income.date) {
      try {
        const date = income.date.toDate ? income.date.toDate() : new Date(income.date);
        if (!isNaN(date.getTime())) {
          const month = date.getMonth();
          monthlyTotals[month] += parseFloat(income.amount) || 0;
          monthlyCounts[month]++;
        }
      } catch (e) {
        console.error("Invalid date format:", e);
      }
    }
  });
  
  return monthlyTotals.map((total, i) => ({
    month: i,
    average: monthlyCounts[i] > 0 ? total / monthlyCounts[i] : 0
  }));
};

function AnalyticsPage() {
  const { currentUser } = useAuth();
  const isPro = useProStatus();
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('month');
  
  const [analytics, setAnalytics] = useState({
    clientPerformance: {
      topClients: [],
      newClients: 0,
      repeatClients: 0
    },
    incomeTrends: {
      growthRate: 0,
      platformComparison: {},
      seasonalPatterns: []
    },
    predictions: {
      projectedEarnings: 0,
      goalProgress: 0,
      confidence: 0
    }
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!currentUser || !isPro) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const now = new Date();
        const q = query(
          collection(db, 'incomes'),
          where('userId', '==', currentUser.uid),
          orderBy('date', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const allIncomes = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          let date = data.date?.toDate ? data.date.toDate() : new Date(data.date);
          allIncomes.push({
            ...data,
            id: doc.id,
            date: date
          });
        });
        
        const currentMonth = now.getMonth();
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        
        let filterDate = null;
        if (timeframe !== 'all') {
          filterDate = new Date(now);
          switch(timeframe) {
            case 'week':
              filterDate.setDate(now.getDate() - 7);
              break;
            case 'month':
              filterDate.setMonth(now.getMonth() - 1);
              break;
            case 'year':
              filterDate.setFullYear(now.getFullYear() - 1);
              break;
            default:
              filterDate = null;
          }
        }
        
        const filteredIncomes = filterDate 
          ? allIncomes.filter(income => {
              const incomeDate = income.date;
              return incomeDate >= filterDate && incomeDate <= now;
            })
          : [...allIncomes];
        
        const incomes = filteredIncomes;
        let recordCount = 0;
        const clients = new Map();
        const monthlyEarnings = Array(12).fill(0);
        let totalEarnings = 0;
        const processedIncomes = [];
        
        for (const income of incomes) {
          try {
            recordCount++;
            
            let date = income.date;
            if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
              date = new Date();
            }
            
            const now = new Date();
            if (date > now) {
              date = new Date(now);
            }
            
            const amount = parseFloat(income.amount) || 0;
            const clientName = income.client || 'Unknown';
            const platform = income.platform || 'Other';
            
            const clientData = clients.get(clientName) || { total: 0, count: 0 };
            clientData.total += amount;
            clientData.count += 1;
            clients.set(clientName, clientData);
            
            totalEarnings += amount;
            
            const month = date.getMonth();
            monthlyEarnings[month] = (monthlyEarnings[month] || 0) + amount;
            
            const incomeRecord = {
              id: income.id,
              amount: amount,
              platform: platform,
              date: date,
              description: income.description || '',
              client: clientName,
              status: 'completed',
              project: income.description || 'No Project',
              ...income
            };
            
            processedIncomes.push(incomeRecord);
            
          } catch (error) {
            console.error("Error processing income record:", error);
          }
        }

        const sortedClients = Array.from(clients.entries())
          .map(([name, data]) => ({
            name,
            totalEarnings: data.total,
            projectCount: data.count,
            averageEarnings: data.total / Math.max(1, data.count)
          }))
          .sort((a, b) => b.totalEarnings - a.totalEarnings);

        const currentMonthEarnings = monthlyEarnings[currentMonth] || 0;
        const previousMonthEarnings = monthlyEarnings[prevMonth] || 0;
        let growthRate = 0;
        if (previousMonthEarnings > 0) {
          growthRate = ((currentMonthEarnings - previousMonthEarnings) / previousMonthEarnings) * 100;
        }

        const platformComparison = calculatePlatformComparison(processedIncomes);
        const monthlyGrowth = calculateMonthlyGrowth(processedIncomes);
        const seasonalPatterns = calculateSeasonalPatterns(processedIncomes);
        
        const last3MonthsEarnings = [
          monthlyEarnings[(currentMonth - 2 + 12) % 12] || 0,
          monthlyEarnings[(currentMonth - 1 + 12) % 12] || 0,
          monthlyEarnings[currentMonth] || 0
        ];
        const last3MonthsAverage = last3MonthsEarnings.reduce((sum, val) => sum + val, 0) / 3;
        
        let bestMonth = 'N/A';
        if (seasonalPatterns.length > 0) {
          const bestMonthIndex = seasonalPatterns.reduce(
            (best, current, i, arr) => 
              current.average > (arr[best]?.average || 0) ? i : best, 
            0
          );
          bestMonth = new Date(0, bestMonthIndex, 1).toLocaleString('default', { month: 'long' });
        }
        
        setAnalytics({
          clientPerformance: {
            topClients: sortedClients.slice(0, 5).map(client => ({
              name: client.name,
              totalEarnings: client.totalEarnings,
              projectCount: client.projectCount,
              avgProjectValue: client.averageEarnings
            })),
            newClients: sortedClients.filter(c => c.projectCount === 1).length,
            repeatClients: sortedClients.filter(c => c.projectCount > 1).length
          },
          incomeTrends: {
            growthRate: parseFloat(growthRate.toFixed(1)),
            platformComparison: platformComparison,
            seasonalPatterns: seasonalPatterns
          },
          predictions: {
            projectedEarnings: Math.round(last3MonthsAverage * 1.1),
            goalProgress: Math.min(100, Math.round((totalEarnings / 10000) * 100)),
            confidence: Math.min(95, Math.max(70, Math.floor(processedIncomes.length / 3 * 100))),
            bestTimeToWork: bestMonth
          }
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [currentUser, isPro, timeframe]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <h3 className="text-lg font-medium text-gray-800 mb-1">Crunching the numbers</h3>
        <p className="text-gray-500 max-w-md">
          Analyzing your income data to provide valuable insights. This may take a moment...
        </p>
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiZap className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Advanced Analytics</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Unlock powerful insights with Pro Analytics, including predictive earnings and client segmentation.
          </p>
          <a
            href="https://trackmyincome.lemonsqueezy.com/buy/fc8795bb-8bc2-483e-badf-a2b2afcfdd30"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium py-2.5 px-6 rounded-lg hover:opacity-90 transition-opacity"
          >
            <span>Upgrade to Pro</span>
            <span className="text-xs bg-yellow-700 text-yellow-100 px-2 py-0.5 rounded-full">
              $9/month
            </span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Insights</h1>
            <p className="text-gray-600">Data-driven analytics to grow your freelance business</p>
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700"
              disabled={isLoading}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
        {/* Client Performance Section */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Top Clients Card - Mobile Optimized */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
             <h3 className="font-medium text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
               <FiAward className="w-5 h-5 text-yellow-500" />
               <span>Top Clients</span>
              </h3>
              <div className="space-y-2 sm:space-y-3 max-h-[300px] overflow-y-auto pr-2 -mr-2">
                {analytics.clientPerformance.topClients.length > 0 ? (
                  analytics.clientPerformance.topClients.map((client, index) => (
                    <div 
                      key={index} 
                      className="flex items-start justify-between gap-2 p-2 sm:p-3 hover:bg-gray-50 rounded-lg"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base break-words line-clamp-2">
                          {client.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {client.projectCount} project{client.projectCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right min-w-[90px] sm:min-w-[110px] shrink-0">
                        <p className="font-bold text-sm sm:text-base text-gray-800">
                          ${client.totalEarnings.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ${Math.round(client.avgProjectValue).toLocaleString()}/project
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm p-2">No client data available</p>
                )}
              </div>
            </div>

              {/* Client Base Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h3 className="font-medium text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <FiUsers className="w-5 h-5 text-blue-500" />
                  <span>Client Base</span>
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">New Clients</span>
                      <span className="text-base sm:text-lg font-bold text-gray-800">
                        {analytics.clientPerformance.newClients}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      First-time clients
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                      <div 
                        className="bg-blue-500 h-full rounded-full" 
                        style={{ 
                          width: `${Math.min(100, analytics.clientPerformance.newClients > 0 ? 
                            (analytics.clientPerformance.newClients / (analytics.clientPerformance.newClients + analytics.clientPerformance.repeatClients)) * 100 : 0)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Repeat Clients</span>
                      <span className="text-base sm:text-lg font-bold text-gray-800">
                        {analytics.clientPerformance.repeatClients}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      Returning clients
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                      <div 
                        className="bg-purple-500 h-full rounded-full" 
                        style={{ 
                          width: `${Math.min(100, analytics.clientPerformance.repeatClients > 0 ? 
                            (analytics.clientPerformance.repeatClients / (analytics.clientPerformance.newClients + analytics.clientPerformance.repeatClients)) * 100 : 0)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-center pt-1">
                    <p className="text-xs sm:text-sm text-gray-600">
                      {analytics.clientPerformance.repeatClients > 0 ? (
                        <>
                          <span className="font-medium text-gray-800">
                            {Math.round((analytics.clientPerformance.repeatClients / (analytics.clientPerformance.newClients + analytics.clientPerformance.repeatClients)) * 100)}%
                          </span> client retention
                        </>
                      ) : (
                        'Track repeat business to see retention'
                      )}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Income Trends Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h3 className="font-medium text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <FiTrendingUp className="w-5 h-5 text-green-500" />
                  <span>Income Trends</span>
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-700">Monthly Growth</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-800">
                          {analytics.incomeTrends.growthRate >= 0 ? '+' : ''}
                          {typeof analytics.incomeTrends.growthRate === 'number' ? 
                            `${Math.round(analytics.incomeTrends.growthRate * 10) / 10}%` : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          vs. previous month
                        </p>
                      </div>
                      <div className={`p-1.5 sm:p-2 rounded-full ${analytics.incomeTrends.growthRate >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <FiTrendingUp className={`w-5 h-5 ${analytics.incomeTrends.growthRate < 0 ? 'transform rotate-180' : ''}`} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700">Top Platforms</h4>
                    {Object.entries(analytics.incomeTrends.platformComparison).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(analytics.incomeTrends.platformComparison)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 3)
                          .map(([platform, amount], i) => (
                            <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                              <span className="text-xs sm:text-sm text-gray-600 truncate pr-2">
                                {platform}
                              </span>
                              <span className="text-xs sm:text-sm font-medium text-gray-800 whitespace-nowrap">
                                ${amount.toLocaleString(undefined, {maximumFractionDigits: 0})}
                              </span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-gray-400 p-2">No platform data available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Core Metrics Section */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Projected Earnings Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <FiPieChart className="w-5 h-5 text-purple-500" />
                  <span>Projected Earnings</span>
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800">
                    ${analytics.predictions.projectedEarnings.toLocaleString()}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      {analytics.predictions.confidence}% confidence
                    </span>
                    <span className="text-xs sm:text-sm text-gray-600">
                      Next 30 days
                    </span>
                  </div>
                </div>
              </div>

              {/* Income Goal Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <FiTarget className="w-5 h-5 text-blue-500" />
                  <span>Income Goal</span>
                </h3>
                <div className="space-y-3">
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-blue-600">
                        {analytics.predictions.goalProgress}%
                      </span>
                      <span className="text-xs font-semibold text-gray-600">
                        $10,000
                      </span>
                    </div>
                    <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-blue-200">
                      <div
                        style={{ width: `${analytics.predictions.goalProgress}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                      ></div>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {analytics.predictions.goalProgress >= 100 ? (
                      '🎉 Goal achieved!'
                    ) : (
                      `$${(10000 - analytics.predictions.projectedEarnings).toLocaleString()} to go`
                    )}
                  </p>
                </div>
              </div>

              {/* Best Time to Work Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <FiCalendar className="w-5 h-5 text-orange-500" />
                  <span>Best Time to Work</span>
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800">
                    {analytics.incomeTrends.seasonalPatterns.length > 0 ? (
                      new Date(0, analytics.incomeTrends.seasonalPatterns.reduce(
                        (bestMonth, current, i, arr) => 
                          current.average > arr[bestMonth].average ? i : bestMonth, 0
                      ), 1).toLocaleString('default', { month: 'long' })
                    ) : 'N/A'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {analytics.incomeTrends.seasonalPatterns.length > 0 ?
                      'Your highest earning month' :
                      'Track more income to see patterns'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;