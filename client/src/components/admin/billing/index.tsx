import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Users, 
  RefreshCw, 
  AlertTriangle,
  FileText,
  Settings,
  Eye,
  Database
} from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { DemoModeProvider, useDemoMode } from '../../../contexts/DemoModeContext';
import RevenueAnalytics from './RevenueAnalytics';
import TransactionManagement from './TransactionManagement';
import CustomerPayments from './CustomerPayments';
import SubscriptionManagement from './SubscriptionManagement';
import RefundsDisputes from './RefundsDisputes';
import FinancialReports from './FinancialReports';
import BillingConfiguration from './BillingConfiguration';

interface BillingManagementProps {}

const BillingManagementContent: React.FC<BillingManagementProps> = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  const navigationItems = [
    { 
      id: 'analytics', 
      label: 'Revenue Analytics', 
      icon: TrendingUp, 
      description: 'Revenue trends and business insights' 
    },
    { 
      id: 'transactions', 
      label: 'Transactions', 
      icon: DollarSign, 
      description: 'Transaction history and management' 
    },
    { 
      id: 'customers', 
      label: 'Customer Payments', 
      icon: Users, 
      description: 'Customer billing and payment methods' 
    },
    { 
      id: 'subscriptions', 
      label: 'Subscriptions', 
      icon: RefreshCw, 
      description: 'Recurring payments and memberships' 
    },
    { 
      id: 'refunds', 
      label: 'Refunds & Disputes', 
      icon: AlertTriangle, 
      description: 'Refund processing and dispute management' 
    },
    { 
      id: 'reports', 
      label: 'Financial Reports', 
      icon: FileText, 
      description: 'Detailed financial reporting and exports' 
    },
    { 
      id: 'configuration', 
      label: 'Configuration', 
      icon: Settings, 
      description: 'Billing settings and payment processing' 
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <RevenueAnalytics />;
      case 'transactions':
        return <TransactionManagement />;
      case 'customers':
        return <CustomerPayments />;
      case 'subscriptions':
        return <SubscriptionManagement />;
      case 'refunds':
        return <RefundsDisputes />;
      case 'reports':
        return <FinancialReports />;
      case 'configuration':
        return <BillingConfiguration />;
      default:
        return <RevenueAnalytics />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Billing Management</h2>
          <p className="text-gray-600">Enterprise billing operations and financial oversight</p>
        </div>
        <div className="flex items-center space-x-3">
          <Card className="px-4 py-2">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-900">Stripe Connected</span>
            </div>
          </Card>
          <Button
            onClick={toggleDemoMode}
            variant="outline"
            className={`flex items-center ${isDemoMode ? 'bg-orange-50 border-orange-300 text-orange-700' : ''}`}
          >
            {isDemoMode ? (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Demo Mode On
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Live Data
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === item.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </Card>

      {/* Content Area */}
      <div className="min-h-[600px]">
        {renderContent()}
      </div>
    </div>
  );
};

// Wrapper component to provide DemoModeContext
const BillingManagement: React.FC<BillingManagementProps> = () => {
  return (
    <DemoModeProvider>
      <BillingManagementContent />
    </DemoModeProvider>
  );
};

export default BillingManagement;