import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { 
  AlertTriangle, 
  RefreshCw,
  Search, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  DollarSign,
  FileText
} from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { useDemoMode } from '../../../contexts/DemoModeContext';
import { GET_REFUNDS_DISPUTES } from '../../../graphql/queries/adminBilling';
import { demoData } from '../../../services/demoData/billingDemoData';

interface RefundDispute {
  id: string;
  type: 'refund' | 'dispute';
  customerName: string;
  customerEmail: string;
  transactionId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'denied' | 'processing' | 'completed';
  createdAt: string;
  updatedAt: string;
  description?: string;
  evidence?: string[];
}

const RefundsDisputes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { isDemoMode } = useDemoMode();

  // Fetch real data from GraphQL
  const { data: refundsDisputesData, loading, error, refetch } = useQuery(GET_REFUNDS_DISPUTES, {
    variables: {
      limit: 50,
      type: typeFilter !== 'all' ? typeFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined
    },
    skip: isDemoMode,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  });

  // Transform real data to match expected structure
  const transformedRealData = useMemo(() => {
    if (!refundsDisputesData?.refundsDisputes?.nodes) return [];
    
    return refundsDisputesData.refundsDisputes.nodes.map((item: any) => ({
      id: item.id,
      type: item.type,
      customerName: item.customer?.name || 'Unknown Customer',
      customerEmail: item.customer?.email || 'No email',
      transactionId: item.transaction?.id || 'Unknown',
      amount: item.amount,
      reason: item.reason,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      description: item.description,
      evidence: item.evidence || []
    }));
  }, [refundsDisputesData]);

  // Use demo data or transformed real data based on mode
  const allItems = isDemoMode ? demoData.refundsDisputes : transformedRealData;
  
  // Filter items client-side
  const items = useMemo(() => {
    return allItems.filter((item: any) => {
      const matchesSearch = !searchTerm || 
        item.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [allItems, searchTerm, typeFilter, statusFilter]);

  const getStatusBadge = (status: RefundDispute['status']) => {
    const config = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Pending' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Approved' },
      denied: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Denied' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', icon: RefreshCw, label: 'Processing' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-800', icon: CheckCircle, label: 'Completed' }
    };
    
    const { bg, text, icon: Icon, label } = config[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </span>
    );
  };

  const getTypeBadge = (type: RefundDispute['type']) => {
    const config = {
      refund: { bg: 'bg-blue-100', text: 'text-blue-800', icon: RefreshCw, label: 'Refund' },
      dispute: { bg: 'bg-orange-100', text: 'text-orange-800', icon: AlertTriangle, label: 'Dispute' }
    };
    
    const { bg, text, icon: Icon, label } = config[type];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
        <Icon className="h-3 w-3 mr-1" />
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalRefunds = items.filter(item => item.type === 'refund').length;
  const totalDisputes = items.filter(item => item.type === 'dispute').length;
  const pendingItems = items.filter(item => item.status === 'pending').length;
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

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
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2 font-medium">Error Loading Refunds & Disputes</p>
          <p className="text-sm text-gray-500 mb-4">{error.message}</p>
          <Button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-700 text-white">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <RefreshCw className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Refunds</p>
                <p className="text-2xl font-bold text-gray-900">{totalRefunds}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Disputes</p>
                <p className="text-2xl font-bold text-gray-900">{totalDisputes}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{pendingItems}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalAmount)}
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
                  placeholder="Search by customer name, email, or transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="lg:w-48">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="refund">Refunds</option>
                <option value="dispute">Disputes</option>
              </select>
            </div>
            <div className="lg:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Showing {items.length} items</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Items Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeBadge(item.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.customerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.customerEmail}
                      </div>
                      <div className="text-xs text-gray-400">
                        {item.transactionId}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      <div className="font-medium">{item.reason}</div>
                      {item.description && (
                        <div className="text-gray-500 text-xs mt-1 truncate">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(item.createdAt)}
                    </div>
                    {item.updatedAt !== item.createdAt && (
                      <div className="text-xs text-gray-500">
                        Updated: {formatDate(item.updatedAt)}
                      </div>
                    )}
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
                      {item.evidence && item.evidence.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-900"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Refunds or Disputes</h3>
            <p className="text-gray-600">
              All transactions are proceeding smoothly with no issues reported.
            </p>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center justify-center">
              <RefreshCw className="h-4 w-4 mr-2" />
              Process Pending Refunds
            </Button>
            <Button variant="outline" className="flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Review Disputes
            </Button>
            <Button variant="outline" className="flex items-center justify-center">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RefundsDisputes;