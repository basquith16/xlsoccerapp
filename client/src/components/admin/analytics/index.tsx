import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Activity } from 'lucide-react';
import { useDemoMode } from '../../../contexts/DemoModeContext';
import { useQuery } from '@apollo/client';
import { GET_BILLING_ANALYTICS } from '../../../graphql/queries/adminBilling';
import { GET_USERS } from '../../../graphql/queries/auth';
import { GET_ADMIN_SESSION_INSTANCES } from '../../../graphql/queries/sessionInstances';
import Card from '../../ui/Card';
import RevenueAnalytics from '../billing/RevenueAnalytics';
import CustomerAnalytics from './CustomerAnalytics';
import OperationalMetrics from './OperationalMetrics';
import BusinessIntelligence from './BusinessIntelligence';
import SimpleChart from './SimpleChart';

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'revenue', name: 'Revenue Analytics', icon: DollarSign },
    { id: 'customers', name: 'Customer Analytics', icon: Users },
    { id: 'operations', name: 'Operations', icon: Activity },
    { id: 'intelligence', name: 'Business Intelligence', icon: TrendingUp },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AnalyticsOverview />;
      case 'revenue':
        return <RevenueAnalytics />;
      case 'customers':
        return <CustomerAnalytics />;
      case 'operations':
        return <OperationalMetrics />;
      case 'intelligence':
        return <BusinessIntelligence />;
      default:
        return <AnalyticsOverview />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-sm md:text-base text-gray-600">Enterprise-level business intelligence and performance metrics</p>
        </div>
        
        {/* Demo/Live Toggle */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Live Data</span>
          <button
            onClick={toggleDemoMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isDemoMode ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isDemoMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-sm text-gray-600">Demo Mode</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {renderContent()}
      </div>
    </div>
  );
};

// Analytics Overview Component
const AnalyticsOverview: React.FC = () => {
  const { isDemoMode } = useDemoMode();
  
  // Fetch real data for overview KPIs
  const { data: billingData } = useQuery(GET_BILLING_ANALYTICS, {
    variables: { timeRange: '30d' },
    skip: isDemoMode,
    errorPolicy: 'all'
  });
  
  const { data: usersData } = useQuery(GET_USERS, {
    variables: { limit: 1000 },
    skip: isDemoMode,
    errorPolicy: 'all'
  });
  
  const { data: instancesData } = useQuery(GET_ADMIN_SESSION_INSTANCES, {
    variables: { limit: 500 },
    skip: isDemoMode,
    errorPolicy: 'all'
  });
  
  // Calculate real metrics or use demo data
  const billing = billingData?.billingAnalytics;
  const users = usersData?.users?.nodes || [];
  const instances = instancesData?.adminSessionInstances?.nodes || [];
  
  const totalBookings = instances.reduce((sum, instance) => sum + (instance.bookedCount || 0), 0);
  const totalRevenue = billing?.totalRevenue || 0;
  const avgSessionValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
  
  const kpis = [
    {
      title: 'Total Revenue',
      value: isDemoMode ? '$52,430' : `$${Math.round(totalRevenue).toLocaleString()}`,
      change: isDemoMode ? '+12.5%' : `${billing?.revenueChange > 0 ? '+' : ''}${Math.round(billing?.revenueChange || 0)}%`,
      trend: isDemoMode ? 'up' : (billing?.revenueChange || 0) >= 0 ? 'up' : 'down',
      icon: DollarSign,
    },
    {
      title: 'Active Customers',
      value: isDemoMode ? '1,247' : (billing?.activeCustomers || 0).toLocaleString(),
      change: isDemoMode ? '+5.8%' : `${billing?.customerChange > 0 ? '+' : ''}${Math.round(billing?.customerChange || 0)}%`,
      trend: isDemoMode ? 'up' : (billing?.customerChange || 0) >= 0 ? 'up' : 'down',
      icon: Users,
    },
    {
      title: 'Session Bookings',
      value: isDemoMode ? '3,891' : totalBookings.toLocaleString(),
      change: isDemoMode ? '+18.2%' : `${billing?.transactionChange > 0 ? '+' : ''}${Math.round(billing?.transactionChange || 0)}%`,
      trend: isDemoMode ? 'up' : (billing?.transactionChange || 0) >= 0 ? 'up' : 'down',
      icon: Calendar,
    },
    {
      title: 'Avg Session Value',
      value: isDemoMode ? '$47.30' : `$${Math.round(avgSessionValue)}`,
      change: isDemoMode ? '+2.1%' : `${billing?.averageOrderChange > 0 ? '+' : ''}${Math.round(billing?.averageOrderChange || 0)}%`,
      trend: isDemoMode ? 'up' : (billing?.averageOrderChange || 0) >= 0 ? 'up' : 'down',
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{kpi.value}</p>
                  <p className={`text-sm ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.change} from last month
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Charts Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (30 days)</h3>
          <RevenuePreviewChart isDemoMode={isDemoMode} billingData={billing} />
        </Card>
        
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Growth</h3>
          <CustomerPreviewChart isDemoMode={isDemoMode} usersData={users} billingData={billing} />
        </Card>
      </div>
    </div>
  );
};

// Revenue Preview Chart Component
const RevenuePreviewChart: React.FC<{ isDemoMode: boolean; billingData: any }> = ({ isDemoMode, billingData }) => {
  if (isDemoMode) {
    // Show demo revenue trend bars
    const demoData = [
      { day: 'Mon', revenue: 1200 },
      { day: 'Tue', revenue: 1800 },
      { day: 'Wed', revenue: 1500 },
      { day: 'Thu', revenue: 2200 },
      { day: 'Fri', revenue: 2800 },
      { day: 'Sat', revenue: 3200 },
      { day: 'Sun', revenue: 2100 }
    ];
    
    const maxRevenue = Math.max(...demoData.map(d => d.revenue));
    
    return (
      <div className="h-48 flex items-end justify-between space-x-2 px-4 pb-4">
        {demoData.map((data, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600"
              style={{ 
                height: `${(data.revenue / maxRevenue) * 140}px`,
                minHeight: '8px'
              }}
            />
            <span className="text-xs text-gray-600 mt-2">{data.day}</span>
          </div>
        ))}
      </div>
    );
  }

  // Show real revenue data if available
  if (billingData?.revenueByMonth) {
    const revenueData = billingData.revenueByMonth.slice(-7); // Last 7 data points
    const maxRevenue = Math.max(...revenueData.map((d: any) => d.revenue));
    
    return (
      <div className="h-48 flex items-end justify-between space-x-2 px-4 pb-4">
        {revenueData.map((data: any, index: number) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className="w-full bg-green-500 rounded-t-sm transition-all duration-300 hover:bg-green-600"
              style={{ 
                height: `${maxRevenue > 0 ? (data.revenue / maxRevenue) * 140 : 8}px`,
                minHeight: '8px'
              }}
            />
            <span className="text-xs text-gray-600 mt-2">
              {(() => {
                // Handle different date formats
                try {
                  if (typeof data.month === 'string') {
                    // If it's already a month name, use it directly
                    if (data.month.length <= 3) return data.month;
                    // Try to parse as date
                    const date = new Date(data.month);
                    if (!isNaN(date.getTime())) {
                      return date.toLocaleDateString('en-US', { month: 'short' });
                    }
                    // If parsing fails, extract first 3 chars
                    return data.month.substring(0, 3);
                  }
                  return `M${index + 1}`;
                } catch (error) {
                  return `M${index + 1}`;
                }
              })()}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Fallback when no data
  return (
    <div className="h-48 flex items-center justify-center text-gray-500">
      <div className="text-center">
        <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">No revenue data available</p>
      </div>
    </div>
  );
};

// Customer Preview Chart Component
const CustomerPreviewChart: React.FC<{ isDemoMode: boolean; usersData: any[]; billingData?: any }> = ({ isDemoMode, usersData, billingData }) => {
  if (isDemoMode) {
    // Show demo customer growth line
    const demoData = [
      { week: 'W1', customers: 850 },
      { week: 'W2', customers: 920 },
      { week: 'W3', customers: 1050 },
      { week: 'W4', customers: 1180 },
      { week: 'W5', customers: 1250 }
    ];
    
    const maxCustomers = Math.max(...demoData.map(d => d.customers));
    const minCustomers = Math.min(...demoData.map(d => d.customers));
    
    return (
      <div className="h-48 relative px-4 py-4">
        <svg className="w-full h-full">
          {demoData.map((data, index) => {
            const x = (index / (demoData.length - 1)) * 100;
            const y = 100 - ((data.customers - minCustomers) / (maxCustomers - minCustomers)) * 80;
            
            return (
              <g key={index}>
                <circle
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="4"
                  fill="#10b981"
                  className="hover:r-6 transition-all duration-200"
                />
                {index < demoData.length - 1 && (
                  <line
                    x1={`${x}%`}
                    y1={`${y}%`}
                    x2={`${(index + 1) / (demoData.length - 1) * 100}%`}
                    y2={`${100 - ((demoData[index + 1].customers - minCustomers) / (maxCustomers - minCustomers)) * 80}%`}
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                )}
              </g>
            );
          })}
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-gray-600">
          {demoData.map((data, index) => (
            <span key={index}>{data.week}</span>
          ))}
        </div>
      </div>
    );
  }

  // Show real customer growth if available - use billing data or user data
  if ((billingData?.activeCustomers && billingData.activeCustomers > 0) || (usersData && usersData.length > 0)) {
    // If we only have billing data, show a simple representation
    if (billingData?.activeCustomers && (!usersData || usersData.length === 0)) {
      // Show active customers as a single metric with trend
      const activeCustomers = billingData.activeCustomers;
      return (
        <div className="h-48 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600">{activeCustomers}</div>
            <div className="text-sm text-gray-600 mt-2">Active Customers</div>
            {billingData.customerChange && (
              <div className={`text-sm mt-2 font-medium ${billingData.customerChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {billingData.customerChange >= 0 ? '+' : ''}{billingData.customerChange.toFixed(1)}% vs last period
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // Group users by week for the last 5 weeks if we have user data
    const now = new Date();
    const weeklyData = [];
    
    for (let i = 4; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
      const weekEnd = new Date(weekStart.getTime() + (7 * 24 * 60 * 60 * 1000));
      
      const weekCustomers = usersData.filter(user => {
        const userDate = new Date(user.createdAt);
        return userDate >= weekStart && userDate < weekEnd;
      }).length;
      
      weeklyData.push({
        week: `W${5-i}`,
        customers: weekCustomers
      });
    }
    
    const maxCustomers = Math.max(...weeklyData.map(d => d.customers), 1);
    
    return (
      <div className="h-48 relative px-4 py-4">
        <svg className="w-full h-full">
          {weeklyData.map((data, index) => {
            const x = (index / (weeklyData.length - 1)) * 100;
            const y = 100 - (data.customers / maxCustomers) * 80;
            
            return (
              <g key={index}>
                <circle
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="4"
                  fill="#3b82f6"
                  className="hover:r-6 transition-all duration-200"
                />
                {index < weeklyData.length - 1 && (
                  <line
                    x1={`${x}%`}
                    y1={`${y}%`}
                    x2={`${(index + 1) / (weeklyData.length - 1) * 100}%`}
                    y2={`${100 - (weeklyData[index + 1].customers / maxCustomers) * 80}%`}
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                )}
              </g>
            );
          })}
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-gray-600">
          {weeklyData.map((data, index) => (
            <span key={index}>{data.week}</span>
          ))}
        </div>
      </div>
    );
  }

  // Fallback when no data
  return (
    <div className="h-48 flex items-center justify-center text-gray-500">
      <div className="text-center">
        <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">No customer data available</p>
      </div>
    </div>
  );
};

export default Analytics;