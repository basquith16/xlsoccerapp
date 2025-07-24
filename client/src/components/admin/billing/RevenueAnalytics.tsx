import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Users, 
  CreditCard,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart
} from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { useDemoMode } from '../../../contexts/DemoModeContext';
import { GET_BILLING_ANALYTICS } from '../../../graphql/queries/adminBilling';
import { demoData } from '../../../services/demoData/billingDemoData';

interface RevenueAnalyticsProps {}

const RevenueAnalytics: React.FC<RevenueAnalyticsProps> = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const { isDemoMode } = useDemoMode();

  // Fetch real data from GraphQL
  const { data: analyticsData, loading, error } = useQuery(GET_BILLING_ANALYTICS, {
    variables: { timeRange },
    skip: isDemoMode, // Skip query when in demo mode
    fetchPolicy: 'cache-and-network'
  });

  // Use demo data or real data based on mode
  const analytics = isDemoMode ? demoData.analytics : analyticsData?.billingAnalytics;
  
  
  // Fallback metrics structure
  const metrics = analytics ? {
    totalRevenue: { 
      value: analytics.totalRevenue || 0, 
      change: analytics.revenueChange || 0, 
      period: `vs previous ${timeRange}` 
    },
    transactions: { 
      value: analytics.totalTransactions || 0, 
      change: analytics.transactionChange || 0, 
      period: `vs previous ${timeRange}` 
    },
    activeCustomers: { 
      value: analytics.activeCustomers || 0, 
      change: analytics.customerChange || 0, 
      period: `vs previous ${timeRange}` 
    },
    averageOrder: { 
      value: analytics.averageOrder || analytics.averageOrderValue || 0, 
      change: analytics.averageOrderChange || 0, 
      period: `vs previous ${timeRange}` 
    }
  } : {
    totalRevenue: { value: 0, change: 0, period: 'No data' },
    transactions: { value: 0, change: 0, period: 'No data' },
    activeCustomers: { value: 0, change: 0, period: 'No data' },
    averageOrder: { value: 0, change: 0, period: 'No data' }
  };

  const revenueData = analytics?.monthlyRevenue || analytics?.revenueByMonth || [];
  const paymentMethods = analytics?.paymentMethodBreakdown || [];
  const topSessions = analytics?.topSessions || [];

  // Show loading state
  if (!isDemoMode && loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show error state
  if (!isDemoMode && error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading analytics data</p>
          <p className="text-sm text-gray-500">{error.message}</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatChange = (change: number) => {
    const isPositive = change > 0;
    return (
      <span className={`inline-flex items-center text-sm font-medium ${
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        {isPositive ? (
          <ArrowUpRight className="h-4 w-4 mr-1" />
        ) : (
          <ArrowDownRight className="h-4 w-4 mr-1" />
        )}
        {Math.abs(change)}%
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="border border-gray-300 rounded-md pl-3 pr-10 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(metrics.totalRevenue.value)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              {formatChange(metrics.totalRevenue.change)}
              <span className="text-xs text-gray-500">{metrics.totalRevenue.period}</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {metrics.transactions.value.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              {formatChange(metrics.transactions.change)}
              <span className="text-xs text-gray-500">{metrics.transactions.period}</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {metrics.activeCustomers.value}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              {formatChange(metrics.activeCustomers.change)}
              <span className="text-xs text-gray-500">{metrics.activeCustomers.period}</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Order</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(metrics.averageOrder.value)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              {formatChange(metrics.averageOrder.change)}
              <span className="text-xs text-gray-500">{metrics.averageOrder.period}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Revenue Trend</h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {revenueData.length > 0 ? revenueData.map((data, index) => (
                <div key={data.month} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{data.month}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${revenueData.length > 0 ? (data.revenue / Math.max(...revenueData.map(d => d.revenue))) * 100 : 0}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-16 text-right">
                      {formatCurrency(data.revenue)}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-500 py-4">
                  <p className="text-sm">No revenue data available</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Payment Methods</h3>
              <PieChart className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {paymentMethods.length > 0 ? paymentMethods.map((method, index) => (
                <div key={method.method} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ 
                        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index] 
                      }}
                    />
                    <span className="text-sm font-medium text-gray-600">{method.method}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(method.amount)}
                    </p>
                    <p className="text-xs text-gray-500">{method.percentage}%</p>
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-500 py-4">
                  <p className="text-sm">No payment method data available</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Top Performing Sessions */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Sessions</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg per Booking
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topSessions.length > 0 ? topSessions.map((session, index) => (
                  <tr key={session.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{session.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(session.revenue)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{session.bookings}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(session.revenue / session.bookings)}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      <p className="text-sm">No session data available</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RevenueAnalytics;