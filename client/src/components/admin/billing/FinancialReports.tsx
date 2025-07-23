import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  DollarSign,
  CreditCard,
  Users,
  PieChart,
  BarChart3,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { useDemoMode } from '../../../contexts/DemoModeContext';
import { GET_BILLING_CONFIGURATION, GET_BILLING_ANALYTICS, GENERATE_FINANCIAL_REPORT } from '../../../graphql/queries/adminBilling';
import { demoData } from '../../../services/demoData/billingDemoData';

const FinancialReports: React.FC = () => {
  const [reportType, setReportType] = useState<string>('revenue');
  const [dateRange, setDateRange] = useState<string>('30d');
  const [format, setFormat] = useState<string>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const { isDemoMode } = useDemoMode();

  const reportTypes = [
    { id: 'revenue', name: 'Revenue Report', description: 'Detailed revenue breakdown and trends' },
    { id: 'transactions', name: 'Transaction Report', description: 'Complete transaction history and analytics' },
    { id: 'customers', name: 'Customer Report', description: 'Customer payment behavior and insights' },
    { id: 'refunds', name: 'Refunds & Disputes', description: 'Refund and dispute activity summary' },
    { id: 'subscriptions', name: 'Subscription Report', description: 'Recurring revenue and subscription metrics' },
    { id: 'tax', name: 'Tax Report', description: 'Tax collection and remittance summary' }
  ];

  // Fetch billing analytics for live data
  const { data: analyticsData, loading: analyticsLoading, error: analyticsError } = useQuery(GET_BILLING_ANALYTICS, {
    variables: { timeRange: '30d' },
    skip: isDemoMode,
    fetchPolicy: 'cache-and-network'
  });

  // Fetch billing configuration for live data
  const { data: configData, loading: configLoading, error: configError } = useQuery(GET_BILLING_CONFIGURATION, {
    skip: isDemoMode,
    fetchPolicy: 'cache-and-network'
  });

  // Calculate stats from demo data or use real data
  const quickStats = useMemo(() => {
    if (isDemoMode) {
      const analytics = demoData.analytics;
      return {
        totalRevenue: analytics.totalRevenue || 0,
        totalTransactions: analytics.totalTransactions || 0,
        activeCustomers: analytics.activeCustomers || 0,
        refundRate: 2.1
      };
    } else {
      // Use real GraphQL data
      const analytics = analyticsData?.billingAnalytics;
      return {
        totalRevenue: analytics?.totalRevenue || 0,
        totalTransactions: analytics?.totalTransactions || 0,
        activeCustomers: analytics?.activeCustomers || 0,
        refundRate: 2.1 // This would come from analytics data in real implementation
      };
    }
  }, [isDemoMode, analyticsData]);

  const generateReport = async (type: string) => {
    setIsGenerating(true);
    
    try {
      if (isDemoMode) {
        // Simulate report generation for demo
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log(`Demo: Generated ${type} report for ${dateRange} in ${format} format`);
        alert(`Demo report generated: ${reportTypes.find(r => r.id === type)?.name}`);
      } else {
        // Real report generation would use GraphQL mutation
        console.log(`Generating ${type} report for ${dateRange} in ${format} format`);
        // Implementation would trigger GENERATE_FINANCIAL_REPORT mutation
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Show loading state
  if (!isDemoMode && (analyticsLoading || configLoading)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show error state
  if (!isDemoMode && (analyticsError || configError)) {
    const error = analyticsError || configError;
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2 font-medium">Error Loading Financial Reports</p>
          <p className="text-sm text-gray-500 mb-4">{error?.message}</p>
          <p className="text-xs text-gray-400">Switch to demo mode to view sample reports</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-gray-900">Financial Reports</h3>
            {isDemoMode && (
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                Demo Mode
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">
            {isDemoMode 
              ? 'Viewing sample financial reports and analytics'
              : 'Generate and download comprehensive financial reports'
            }
          </p>
        </div>
        <Button
          onClick={() => generateReport(reportType)}
          disabled={isGenerating}
          className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </>
          )}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(quickStats.totalRevenue)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quickStats.totalTransactions.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quickStats.activeCustomers}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <RefreshCw className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Refund Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quickStats.refundRate}%
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Report Configuration */}
      <Card>
        <div className="p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Report Configuration</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {reportTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {reportTypes.find(t => t.id === reportType)?.description}
              </p>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="6m">Last 6 months</option>
                <option value="1y">Last year</option>
                <option value="ytd">Year to date</option>
                <option value="custom">Custom range</option>
              </select>
            </div>

            {/* Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pdf">PDF Report</option>
                <option value="excel">Excel Spreadsheet</option>
                <option value="csv">CSV Data</option>
                <option value="json">JSON Data</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Available Reports */}
      <Card>
        <div className="p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Available Reports</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTypes.map((report) => (
              <div
                key={report.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  reportType === report.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setReportType(report.id)}
              >
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {report.id === 'revenue' && <TrendingUp className="h-5 w-5 text-blue-600" />}
                    {report.id === 'transactions' && <CreditCard className="h-5 w-5 text-blue-600" />}
                    {report.id === 'customers' && <Users className="h-5 w-5 text-blue-600" />}
                    {report.id === 'refunds' && <RefreshCw className="h-5 w-5 text-blue-600" />}
                    {report.id === 'subscriptions' && <Calendar className="h-5 w-5 text-blue-600" />}
                    {report.id === 'tax' && <FileText className="h-5 w-5 text-blue-600" />}
                  </div>
                  <h5 className="ml-3 font-medium text-gray-900">{report.name}</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    generateReport(report.id);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Recent Reports */}
      <Card>
        <div className="p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Reports</h4>
          
          <div className="space-y-3">
            {[
              { name: 'Revenue Report - January 2024', type: 'PDF', size: '2.3 MB', date: '2024-01-20' },
              { name: 'Transaction Report - Q4 2023', type: 'Excel', size: '5.7 MB', date: '2024-01-15' },
              { name: 'Customer Analysis - December 2023', type: 'PDF', size: '1.8 MB', date: '2024-01-10' },
              { name: 'Tax Report - 2023', type: 'CSV', size: '892 KB', date: '2024-01-05' }
            ].map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded">
                    <FileText className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{report.name}</p>
                    <p className="text-xs text-gray-500">
                      {report.type} • {report.size} • Generated on {report.date}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Scheduled Reports</h4>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </div>
          
          <div className="space-y-3">
            {[
              { name: 'Monthly Revenue Report', frequency: 'Monthly', nextRun: '2024-02-01', format: 'PDF' },
              { name: 'Weekly Transaction Summary', frequency: 'Weekly', nextRun: '2024-01-28', format: 'Email' },
              { name: 'Quarterly Tax Report', frequency: 'Quarterly', nextRun: '2024-04-01', format: 'Excel' }
            ].map((schedule, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{schedule.name}</p>
                  <p className="text-xs text-gray-500">
                    {schedule.frequency} • Next: {schedule.nextRun} • Format: {schedule.format}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FinancialReports;