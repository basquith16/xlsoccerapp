import React, { useState } from 'react';
import { useDemoMode } from '../../../contexts/DemoModeContext';
import { demoData } from '../../../services/demoData/billingDemoData';
import { 
  RefreshCw, 
  Search, 
  Filter, 
  Plus,
  Eye,
  Edit,
  Pause,
  Play,
  X,
  Calendar,
  DollarSign,
  Users,
  TrendingUp
} from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

interface Subscription {
  id: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  status: 'active' | 'paused' | 'cancelled' | 'past_due';
  amount: number;
  interval: 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBilling: string;
  trialEnd?: string;
  createdAt: string;
}

const SubscriptionManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [intervalFilter, setIntervalFilter] = useState<string>('all');
  const { isDemoMode } = useDemoMode();

  // Use demo data when in demo mode - in production this would connect to real GraphQL
  const subscriptions = isDemoMode ? (demoData.subscriptions || []) : [];
  
  // Mock data kept for reference
  const fallbackSubscriptions: Subscription[] = [
    {
      id: 'sub_1',
      customerName: 'John Smith',
      customerEmail: 'john.smith@email.com',
      planName: 'Premium Monthly',
      status: 'active',
      amount: 29.99,
      interval: 'monthly',
      currentPeriodStart: '2024-01-01T00:00:00Z',
      currentPeriodEnd: '2024-02-01T00:00:00Z',
      nextBilling: '2024-02-01T00:00:00Z',
      createdAt: '2023-06-15T00:00:00Z'
    },
    {
      id: 'sub_2',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah.j@email.com',
      planName: 'Team Yearly',
      status: 'active',
      amount: 299.99,
      interval: 'yearly',
      currentPeriodStart: '2024-01-01T00:00:00Z',
      currentPeriodEnd: '2025-01-01T00:00:00Z',
      nextBilling: '2025-01-01T00:00:00Z',
      createdAt: '2023-08-22T00:00:00Z'
    },
    {
      id: 'sub_3',
      customerName: 'Mike Davis',
      customerEmail: 'mike.davis@email.com',
      planName: 'Basic Monthly',
      status: 'paused',
      amount: 19.99,
      interval: 'monthly',
      currentPeriodStart: '2024-01-01T00:00:00Z',
      currentPeriodEnd: '2024-02-01T00:00:00Z',
      nextBilling: '2024-02-01T00:00:00Z',
      createdAt: '2023-11-05T00:00:00Z'
    }
  ];

  const getStatusBadge = (status: Subscription['status']) => {
    const config = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      paused: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Paused' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
      past_due: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Past Due' }
    };
    
    // Default to active if status is not recognized
    const statusConfig = config[status] || config.active;
    const { bg, text, label } = statusConfig;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
        {label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Apply filters to subscriptions
  const filteredSubscriptions = subscriptions.filter((subscription: any) => {
    const matchesSearch = !searchTerm || 
      subscription.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.planName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    const matchesInterval = intervalFilter === 'all' || subscription.interval === intervalFilter;
    
    return matchesSearch && matchesStatus && matchesInterval;
  });

  const totalMRR = subscriptions
    .filter(sub => sub?.status === 'active' && sub?.interval === 'monthly')
    .reduce((sum, sub) => sum + (sub?.amount || 0), 0);

  const totalARR = subscriptions
    .filter(sub => sub?.status === 'active')
    .reduce((sum, sub) => sum + (sub?.interval === 'yearly' ? (sub?.amount || 0) : (sub?.amount || 0) * 12), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <RefreshCw className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscriptions.filter(s => s?.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Recurring Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalMRR)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Annual Recurring Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalARR)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscriptions.length}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search subscriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="lg:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
                <option value="past_due">Past Due</option>
              </select>
            </div>
            <div className="lg:w-48">
              <select
                value={intervalFilter}
                onChange={(e) => setIntervalFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Intervals</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Subscription
            </Button>
          </div>
        </div>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Billing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <RefreshCw className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Subscriptions Found</h3>
                      <p className="text-gray-600 mb-4">
                        {searchTerm || statusFilter !== 'all' || intervalFilter !== 'all'
                          ? 'No subscriptions match your current filters.'
                          : 'No subscriptions have been created yet.'}
                      </p>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Subscription
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {subscription.customerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {subscription.customerEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {subscription.planName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {subscription.interval}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(subscription.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(subscription.amount)}
                    </div>
                    <div className="text-sm text-gray-500">
                      per {subscription.interval.slice(0, -2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(subscription.nextBilling)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {subscription.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : subscription.status === 'paused' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-900"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default SubscriptionManagement;