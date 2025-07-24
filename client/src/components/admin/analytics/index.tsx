import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Activity } from 'lucide-react';
import { useDemoMode } from '../../../contexts/DemoModeContext';
import Card from '../../ui/Card';
import RevenueChart from './RevenueChart';
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
        return <RevenueChart />;
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
  
  const kpis = [
    {
      title: 'Total Revenue',
      value: isDemoMode ? '$52,430' : '$28,920',
      change: isDemoMode ? '+12.5%' : '+8.3%',
      trend: 'up',
      icon: DollarSign,
    },
    {
      title: 'Active Customers',
      value: isDemoMode ? '1,247' : '892',
      change: isDemoMode ? '+5.8%' : '+3.2%',
      trend: 'up',
      icon: Users,
    },
    {
      title: 'Session Bookings',
      value: isDemoMode ? '3,891' : '2,156',
      change: isDemoMode ? '+18.2%' : '+14.7%',
      trend: 'up',
      icon: Calendar,
    },
    {
      title: 'Avg Session Value',
      value: isDemoMode ? '$47.30' : '$41.80',
      change: isDemoMode ? '+2.1%' : '-1.4%',
      trend: isDemoMode ? 'up' : 'down',
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
          <RevenueChart />
        </Card>
        
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Growth</h3>
          <CustomerAnalytics />
        </Card>
      </div>
    </div>
  );
};

export default Analytics;