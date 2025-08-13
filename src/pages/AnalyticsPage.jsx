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
      platforms[income.platform] = (platforms[income.platform] || 0) + (Number(income.amount) || 0);
    }
  });
  return platforms;
};

const calculateMonthlyGrowth = (incomes) => {
  const monthlyData = {};
  
  // Group by month
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
  
  // Sort months
  const sortedMonths = Object.keys(monthlyData).sort();
  if (sortedMonths.length < 2) return 0;
  
  // Calculate growth rate
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
        if (!isNaN(date.getTime())) { // Check if date is valid
          const month = date.getMonth();
          monthlyTotals[month] += parseFloat(income.amount) || 0;
          monthlyCounts[month]++;
        }
      } catch (e) {
        console.error('Error processing date:', income.date, e);
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
    console.log('Timeframe changed to:', timeframe); // Debug log
    const fetchAnalytics = async () => {
      if (!currentUser || !isPro) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const now = new Date();
        
        // First, fetch all records
        console.log('[DEBUG] Fetching all income records...');
        const q = query(
          collection(db, 'incomes'),
          where('userId', '==', currentUser.uid),
          orderBy('date', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        console.log(`[DEBUG] Found ${querySnapshot.size} total records`);
        
        // Process all records first
        const allIncomes = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          let date = data.date?.toDate ? data.date.toDate() : new Date(data.date);
          allIncomes.push({
            ...data,
            id: doc.id,
            date: date
          });
          console.log(`[DEBUG] Record: ${doc.id} - ${date.toISOString()} - $${data.amount}`);
        });
        
        // Process the filtered incomes
        const currentMonth = now.getMonth();
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        
        // Calculate filter date based on timeframe
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
        
        console.log(`[DEBUG] Current date range: ${filterDate ? filterDate.toISOString() : 'No date filter'} to ${now.toISOString()}`);
        
        // Filter incomes by date if needed
        const filteredIncomes = filterDate 
          ? allIncomes.filter(income => {
              const incomeDate = income.date?.toDate ? income.date.toDate() : new Date(income.date);
              return incomeDate >= filterDate && incomeDate <= now;
            })
          : [...allIncomes];
        
        console.log(`[DEBUG] Found ${filteredIncomes.length} records after date filtering`);
        
        // Initialize variables for processing
        const incomes = filteredIncomes;
        let recordCount = 0;
        const clients = new Map();
        const monthlyEarnings = Array(12).fill(0);
        let totalEarnings = 0;
        const processedIncomes = [];
        
        for (const income of incomes) {
          try {
            recordCount++;
            
            // Parse and validate date
            let date = income.date;
            if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
              console.warn('Invalid or missing date, using current date');
              date = new Date();
            }
            
            // Ensure date is not in the future
            const now = new Date();
            if (date > now) {
              console.warn('Future date detected, using current date instead');
              date = new Date(now);
            }
            
            const amount = parseFloat(income.amount) || 0;
            const clientName = income.client || 'Unknown';
            const platform = income.platform || 'Other';
            
            console.log(`[DEBUG] Processing record ${recordCount}:`, {
              id: income.id,
              amount: amount,
              date: date.toISOString(),
              client: clientName,
              platform: platform
            });
            
            // Track client data
            const clientData = clients.get(clientName) || { total: 0, count: 0 };
            clientData.total += amount;
            clientData.count += 1;
            clients.set(clientName, clientData);
            
            // Track total earnings
            totalEarnings += amount;
            
            // Track monthly earnings
            const month = date.getMonth();
            monthlyEarnings[month] = (monthlyEarnings[month] || 0) + amount;
            
            // Prepare income record
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
            console.error('Error processing income record:', error);
          }
        }

        // Process client data
        const sortedClients = Array.from(clients.entries())
          .map(([name, data]) => ({
            name,
            totalEarnings: data.total,
            projectCount: data.count,
            averageEarnings: data.total / Math.max(1, data.count)
          }))
          .sort((a, b) => b.totalEarnings - a.totalEarnings);

        // Calculate growth rate (month over month)
        const currentMonthEarnings = monthlyEarnings[currentMonth] || 0;
        const previousMonthEarnings = monthlyEarnings[prevMonth] || 0;
        let growthRate = 0;
        if (previousMonthEarnings > 0) {
          growthRate = ((currentMonthEarnings - previousMonthEarnings) / previousMonthEarnings) * 100;
        }

        // Calculate platform comparison
        const platformComparison = calculatePlatformComparison(processedIncomes);
        
        // Calculate monthly growth
        const monthlyGrowth = calculateMonthlyGrowth(processedIncomes);
        
        // Calculate seasonal patterns
        const seasonalPatterns = calculateSeasonalPatterns(processedIncomes);
        
        // Calculate last 3 months average for projections
        const last3MonthsEarnings = [
          monthlyEarnings[(currentMonth - 2 + 12) % 12] || 0,
          monthlyEarnings[(currentMonth - 1 + 12) % 12] || 0,
          monthlyEarnings[currentMonth] || 0
        ];
        const last3MonthsAverage = last3MonthsEarnings.reduce((sum, val) => sum + val, 0) / 3;
        
        // Determine best time to work based on seasonal patterns
        let bestMonth = 'N/A';
        if (seasonalPatterns.length > 0) {
          const bestMonthIndex = seasonalPatterns.reduce(
            (best, current, i, arr) => 
              current.average > (arr[best]?.average || 0) ? i : best, 
            0
          );
          bestMonth = new Date(0, bestMonthIndex, 1).toLocaleString('default', { month: 'long' });
        }
        
        // Update analytics state with the correct structure
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
            projectedEarnings: Math.round(last3MonthsAverage * 1.1), // 10% growth projection
            goalProgress: Math.min(100, Math.round((totalEarnings / 10000) * 100)), // Example $10k goal
            confidence: Math.min(95, Math.max(70, Math.floor(processedIncomes.length / 3 * 100))), // Confidence based on data points
            bestTimeToWork: bestMonth
          },
          _debug: {
            totalEarnings,
            incomeCount: processedIncomes.length,
            processedAt: new Date().toISOString()
          }
        });
        
        console.log('[DEBUG] Analytics data updated:', {
          totalEarnings,
          growthRate,
          recordCount: processedIncomes.length,
          timeFrame: timeframe
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
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
            {/* Client Performance */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <FiAward className="w-5 h-5 text-yellow-500" />
                  Top Clients
                </h3>
                <div className="space-y-4">
                  {analytics.clientPerformance.topClients.length > 0 ? (
                    analytics.clientPerformance.topClients.map((client, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="truncate">
                          <p className="font-medium truncate">{client.name}</p>
                          <p className="text-sm text-gray-500">{client.projectCount} project{client.projectCount !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${client.totalEarnings.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">${Math.round(client.avgProjectValue)}/project</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No client data available</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <FiUsers className="w-5 h-5 text-blue-500" />
                  Client Base
                </h3>
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">New Clients</span>
                      <span className="text-lg font-bold">{analytics.clientPerformance.newClients}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, analytics.clientPerformance.newClients > 0 ? 
                            (analytics.clientPerformance.newClients / (analytics.clientPerformance.newClients + analytics.clientPerformance.repeatClients)) * 100 : 0)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Repeat Clients</span>
                      <span className="text-lg font-bold">{analytics.clientPerformance.repeatClients}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, analytics.clientPerformance.repeatClients > 0 ? 
                            (analytics.clientPerformance.repeatClients / (analytics.clientPerformance.newClients + analytics.clientPerformance.repeatClients)) * 100 : 0)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-center pt-2">
                    <p className="text-sm text-gray-500">
                      {analytics.clientPerformance.repeatClients > 0 ? 
                        `${Math.round((analytics.clientPerformance.repeatClients / (analytics.clientPerformance.newClients + analytics.clientPerformance.repeatClients)) * 100)}% client retention` :
                        'Track repeat business to see retention rate'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <FiTrendingUp className="w-5 h-5 text-green-500" />
                  Income Trends
                </h3>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Monthly Growth</p>
                        <p className="text-2xl font-bold">
                          {analytics.incomeTrends.growthRate >= 0 ? '+' : ''}
                          {analytics.incomeTrends.growthRate}%
                        </p>
                      </div>
                      <div className={`p-2 rounded-full ${analytics.incomeTrends.growthRate >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <FiTrendingUp className={`w-6 h-6 ${analytics.incomeTrends.growthRate < 0 ? 'transform rotate-180' : ''}`} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Top Platforms</h4>
                    {Object.entries(analytics.incomeTrends.platformComparison).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(analytics.incomeTrends.platformComparison)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 3)
                          .map(([platform, amount], i) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{platform}</span>
                              <span className="text-sm font-medium">${amount.toLocaleString()}</span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No platform data available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Core Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <FiPieChart className="w-5 h-5 text-purple-500" />
                  Projected Earnings
                </h3>
                <div className="space-y-4">
                  <p className="text-3xl font-bold text-gray-900">
                    ${analytics.predictions.projectedEarnings.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      {analytics.predictions.confidence}% confidence
                    </span>
                    <span>Next 30 days</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <FiTarget className="w-5 h-5 text-blue-500" />
                  Income Goal
                </h3>
                <div className="space-y-4">
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block text-blue-600">
                          {analytics.predictions.goalProgress}%
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-gray-600">
                          $10,000
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                      <div
                        style={{ width: `${analytics.predictions.goalProgress}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {analytics.predictions.goalProgress >= 100 ? (
                      '🎉 Goal achieved! Set a new goal in settings.'
                    ) : (
                      `$${10000 - analytics.predictions.projectedEarnings.toLocaleString()} to go this month`
                    )}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <FiCalendar className="w-5 h-5 text-orange-500" />
                  Best Time to Work
                </h3>
                <div className="space-y-4">
                  <p className="text-3xl font-bold text-gray-900">
                    {analytics.incomeTrends.seasonalPatterns.length > 0 ? (
                      new Date(0, analytics.incomeTrends.seasonalPatterns.reduce(
                        (bestMonth, current, i, arr) => 
                          current.average > arr[bestMonth].average ? i : bestMonth, 0
                      ), 1).toLocaleString('default', { month: 'long' })
                    ) : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {analytics.incomeTrends.seasonalPatterns.length > 0 ?
                      'Your highest earning month on average' :
                      'Track more income to see seasonal patterns'}
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
