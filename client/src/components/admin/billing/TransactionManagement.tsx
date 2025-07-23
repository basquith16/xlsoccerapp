import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import { useDemoMode } from '../../../contexts/DemoModeContext';
import { GET_ADMIN_TRANSACTIONS } from '../../../graphql/queries/adminBilling';
import { demoData, formatDate } from '../../../services/demoData/billingDemoData';

interface Transaction {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded' | 'disputed';
  paymentMethod: string;
  sessionName: string;
  createdAt: string;
  stripeTransactionId: string;
  fees: number;
  netAmount: number;
}

interface TransactionManagementProps {}

// Simple debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const TransactionManagement: React.FC<TransactionManagementProps> = () => {
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30d');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const { isDemoMode } = useDemoMode();

  // Debounce search term to prevent excessive API calls
  const searchTerm = useDebounce(searchInput, 500);

  // Memoize query variables to prevent unnecessary re-fetches
  const queryVariables = useMemo(() => ({
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    startDate: dateRange !== 'all' ? new Date(Date.now() - (dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365) * 24 * 60 * 60 * 1000).toISOString() : undefined
  }), [itemsPerPage, currentPage, searchTerm, statusFilter, dateRange]);

  // Fetch real data from GraphQL
  const { data: transactionData, loading, error, refetch } = useQuery(GET_ADMIN_TRANSACTIONS, {
    variables: queryVariables,
    skip: isDemoMode,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true
  });

  // Transform real data to match expected structure
  const transformedRealData = useMemo(() => {
    if (!transactionData?.adminTransactions?.nodes) return [];
    
    return transactionData.adminTransactions.nodes.map((transaction: any) => ({
      id: transaction.id,
      customerName: transaction.customer?.name || 'Unknown Customer',
      customerEmail: transaction.customer?.email || 'No email',
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      paymentMethod: transaction.paymentMethod?.card ? 
        `${transaction.paymentMethod.card.brand?.toUpperCase()} •••• ${transaction.paymentMethod.card.last4}` : 
        'Unknown',
      sessionName: transaction.session?.name || transaction.description || 'No session',
      createdAt: transaction.createdAt,
      stripeTransactionId: transaction.stripePaymentIntentId,
      fees: transaction.fees || 0,
      netAmount: transaction.netAmount || transaction.amount
    }));
  }, [transactionData]);

  // Use demo data or transformed real data based on mode
  const allTransactions = isDemoMode ? demoData.transactions : transformedRealData;
  
  // Filter demo data client-side if in demo mode
  const transactions = useMemo(() => {
    if (!isDemoMode) return allTransactions;
    
    let filtered = allTransactions.filter((t: any) => {
      const matchesSearch = !searchTerm || 
        t.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.sessionName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      
      const matchesDate = dateRange === 'all' || 
        new Date(t.createdAt) > new Date(Date.now() - (dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365) * 24 * 60 * 60 * 1000);
      
      return matchesSearch && matchesStatus && matchesDate;
    });
    
    // Paginate demo data
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [isDemoMode, allTransactions, searchTerm, statusFilter, dateRange, currentPage, itemsPerPage]);

  const totalCount = isDemoMode ? allTransactions.length : (transactionData?.adminTransactions?.totalCount || 0);
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateRange]);

  // Show loading state
  if (!isDemoMode && loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show error state with rate limiting info
  if (!isDemoMode && error) {
    const isRateLimited = error.message.includes('rate') || error.message.includes('limit') || error.message.includes('429');
    
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2 font-medium">
            {isRateLimited ? 'Rate Limit Exceeded' : 'Error Loading Transactions'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {isRateLimited 
              ? 'Too many requests. Please wait a moment before trying again.'
              : error.message
            }
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => refetch()} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isRateLimited}
            >
              {isRateLimited ? 'Please Wait...' : 'Try Again'}
            </Button>
            <p className="text-xs text-gray-400">
              Switch to demo mode to view sample data
            </p>
          </div>
        </div>
      </div>
    );
  }


  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'refunded':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      case 'disputed':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    const config = {
      succeeded: { bg: 'bg-green-100', text: 'text-green-800', label: 'Succeeded' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
      refunded: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Refunded' },
      disputed: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Disputed' }
    };
    
    // Default to pending if status is not recognized
    const statusConfig = config[status] || config.pending;
    const { bg, text, label } = statusConfig;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
        {getStatusIcon(status)}
        <span className="ml-1">{label}</span>
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDateLocal = (dateString: string) => {
    return formatDate(dateString);
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetails(true);
  };

  const handleExportTransactions = () => {
    // Implementation for exporting transactions
    console.log('Exporting transactions...');
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer, email, or session..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="succeeded">Succeeded</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
                <option value="disputed">Disputed</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="lg:w-48">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>

            {/* Export Button */}
            <Button
              onClick={handleExportTransactions}
              variant="outline"
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>
                Showing {transactions.length} of {totalCount} transactions
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length > 0 ? transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.customerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.customerEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Net: {formatCurrency(transaction.netAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {transaction.paymentMethod}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {transaction.sessionName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDateLocal(transaction.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleViewDetails(transaction)}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => window.open(`https://dashboard.stripe.com/payments/${transaction.stripeTransactionId}`, '_blank')}
                        variant="outline"
                        size="sm"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    <p className="text-sm">No transactions found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Transaction Details Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="Transaction Details"
        size="lg"
      >
        {selectedTransaction && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction ID
                </label>
                <p className="text-sm text-gray-900 font-mono">
                  {selectedTransaction.id}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stripe Transaction ID
                </label>
                <p className="text-sm text-gray-900 font-mono">
                  {selectedTransaction.stripeTransactionId}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer
                </label>
                <p className="text-sm text-gray-900">
                  {selectedTransaction.customerName}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedTransaction.customerEmail}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session
                </label>
                <p className="text-sm text-gray-900">
                  {selectedTransaction.sessionName}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(selectedTransaction.amount)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fees
                </label>
                <p className="text-sm text-red-600">
                  -{formatCurrency(selectedTransaction.fees)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Net Amount
                </label>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(selectedTransaction.netAmount)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="mt-1">
                  {getStatusBadge(selectedTransaction.status)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <p className="text-sm text-gray-900">
                  {selectedTransaction.paymentMethod}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Date
              </label>
              <p className="text-sm text-gray-900">
                {formatDate(selectedTransaction.createdAt)}
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                onClick={() => window.open(`https://dashboard.stripe.com/payments/${selectedTransaction.stripeTransactionId}`, '_blank')}
                variant="outline"
                className="flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View in Stripe
              </Button>
              <Button
                onClick={() => setShowDetails(false)}
                variant="primary"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TransactionManagement;