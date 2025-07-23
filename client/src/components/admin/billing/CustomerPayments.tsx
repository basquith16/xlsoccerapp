import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { 
  Search, 
  Filter, 
  Users, 
  CreditCard,
  Eye,
  Edit,
  Plus,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
  Phone
} from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import { useDemoMode } from '../../../contexts/DemoModeContext';
import { GET_ADMIN_CUSTOMERS } from '../../../graphql/queries/adminBilling';
import { demoData } from '../../../services/demoData/billingDemoData';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalSpent: number;
  lastPayment: string;
  paymentMethods: PaymentMethod[];
  defaultPaymentMethod?: string;
  subscriptions: number;
  status: 'active' | 'inactive' | 'suspended';
  riskLevel: 'low' | 'medium' | 'high';
  joinedDate: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface CustomerPaymentsProps {}

const CustomerPayments: React.FC<CustomerPaymentsProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { isDemoMode } = useDemoMode();

  // Fetch real data from GraphQL
  const { data: customerData, loading, error } = useQuery(GET_ADMIN_CUSTOMERS, {
    variables: {
      limit: 50,
      search: searchTerm || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined
    },
    skip: isDemoMode,
    fetchPolicy: 'cache-and-network'
  });

  // Transform real data to match demo data structure
  const transformedRealData = customerData?.adminCustomers?.nodes?.map((customer: any) => ({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    totalSpent: customer.billing?.totalSpent || 0,
    lastPayment: customer.billing?.lastPaymentDate || '',
    paymentMethods: customer.paymentMethods?.map((pm: any) => ({
      id: pm.id,
      type: pm.type,
      last4: pm.card?.last4 || '',
      brand: pm.card?.brand || '',
      expiryMonth: pm.card?.exp_month || 0,
      expiryYear: pm.card?.exp_year || 0,
      isDefault: pm.isDefault || false
    })) || [],
    defaultPaymentMethod: customer.billing?.defaultPaymentMethodId,
    subscriptions: customer.billing?.subscriptionCount || 0,
    status: customer.billing?.status || 'active',
    riskLevel: customer.billing?.riskLevel || 'low',
    joinedDate: customer.createdAt
  })) || [];

  // Use demo data or transformed real data based on mode
  const customers = isDemoMode ? demoData.customers : transformedRealData;
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);


  const getStatusBadge = (status: Customer['status']) => {
    const config = {
      active: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock },
      suspended: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle }
    };
    
    // Default to active if status is not recognized
    const statusConfig = config[status] || config.active;
    const { bg, text, icon: Icon } = statusConfig;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRiskBadge = (riskLevel: Customer['riskLevel']) => {
    const config = {
      low: { bg: 'bg-green-100', text: 'text-green-800' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      high: { bg: 'bg-red-100', text: 'text-red-800' }
    };
    
    // Default to low if risk level is not recognized
    const riskConfig = config[riskLevel] || config.low;
    const { bg, text } = riskConfig;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
        {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
      </span>
    );
  };

  const getCardIcon = (brand: string) => {
    const icons = {
      visa: '💳',
      mastercard: '💳',
      american_express: '💳',
      discover: '💳'
    };
    return icons[brand as keyof typeof icons] || '💳';
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

  const filteredCustomers = customers.filter((customer: any) => {
    const matchesSearch = !searchTerm || 
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    const matchesRisk = riskFilter === 'all' || customer.riskLevel === riskFilter;
    
    return matchesSearch && matchesStatus && matchesRisk;
  });

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetails(true);
  };

  const handleViewPaymentMethods = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowPaymentMethods(true);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Payment Methods</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.reduce((sum, c) => sum + c.paymentMethods.length, 0)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.riskLevel === 'high').length}
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
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Risk Filter */}
            <div className="lg:w-48">
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Risk Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>
                Showing {paginatedCustomers.length} of {filteredCustomers.length} customers
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Customers Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Methods
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(customer.totalSpent)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {customer.subscriptions} subscription{customer.subscriptions !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      {customer.paymentMethods.slice(0, 3).map((method, index) => (
                        <div key={method.id} className="flex items-center">
                          <span className="text-lg">{getCardIcon(method.brand)}</span>
                          {method.isDefault && (
                            <Star className="h-3 w-3 text-yellow-400 ml-1" />
                          )}
                        </div>
                      ))}
                      {customer.paymentMethods.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{customer.paymentMethods.length - 3} more
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {customer.paymentMethods.length} method{customer.paymentMethods.length !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(customer.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRiskBadge(customer.riskLevel)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {customer.lastPayment ? formatDate(customer.lastPayment) : 'Never'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleViewDetails(customer)}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleViewPaymentMethods(customer)}
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-900"
                      >
                        <CreditCard className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} results
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

      {/* Customer Details Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="Customer Details"
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <p className="text-sm text-gray-900">
                  {selectedCustomer.name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <p className="text-sm text-gray-900">
                  {selectedCustomer.email}
                </p>
              </div>
            </div>

            {selectedCustomer.phone && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <p className="text-sm text-gray-900">
                  {selectedCustomer.phone}
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Spent
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(selectedCustomer.totalSpent)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Active Subscriptions
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedCustomer.subscriptions}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Methods
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedCustomer.paymentMethods.length}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="mt-1">
                  {getStatusBadge(selectedCustomer.status)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Risk Level
                </label>
                <div className="mt-1">
                  {getRiskBadge(selectedCustomer.riskLevel)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Joined Date
                </label>
                <p className="text-sm text-gray-900">
                  {formatDate(selectedCustomer.joinedDate)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Payment
                </label>
                <p className="text-sm text-gray-900">
                  {selectedCustomer.lastPayment ? formatDate(selectedCustomer.lastPayment) : 'Never'}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                onClick={() => handleViewPaymentMethods(selectedCustomer)}
                variant="outline"
                className="flex items-center"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                View Payment Methods
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

      {/* Payment Methods Modal */}
      <Modal
        isOpen={showPaymentMethods}
        onClose={() => setShowPaymentMethods(false)}
        title="Customer Payment Methods"
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedCustomer.name}
                </h3>
                <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </div>

            {selectedCustomer.paymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Methods</h3>
                <p className="text-gray-600">This customer hasn't added any payment methods yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedCustomer.paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {getCardIcon(method.brand)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {method.brand.toUpperCase()} •••• {method.last4}
                          {method.isDefault && (
                            <Star className="h-4 w-4 text-yellow-400 inline ml-2" />
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          Expires {method.expiryMonth}/{method.expiryYear}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!method.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-800"
                        >
                          Set Default
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                onClick={() => setShowPaymentMethods(false)}
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

export default CustomerPayments;