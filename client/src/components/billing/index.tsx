import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { 
  useCustomer, 
  useTransactions, 
  usePaymentMethods,
  useDetachPaymentMethod,
  useSetDefaultPaymentMethod
} from '../../services/graphqlService';
import AddPaymentMethodModal from './AddPaymentMethodModal';
import TransactionHistory from './TransactionHistory';
import PaymentMethodsList from './PaymentMethodsList';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key');

const BillingPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'payment-methods'>('transactions');
  const [showAddModal, setShowAddModal] = useState(false);
  const [removingCard, setRemovingCard] = useState<string | null>(null);

  const { data: customerData, loading: customerLoading, refetch: refetchCustomer } = useCustomer();
  const { data: transactionsData, loading: transactionsLoading, refetch: refetchTransactions } = useTransactions();
  const { data: paymentMethodsData, loading: paymentMethodsLoading, refetch: refetchPaymentMethods } = usePaymentMethods();

  const [detachPaymentMethod] = useDetachPaymentMethod();
  const [setDefaultPaymentMethod] = useSetDefaultPaymentMethod();

  const customer = customerData?.customer;
  const transactions = transactionsData?.transactions || [];
  const paymentMethods = paymentMethodsData?.paymentMethods || [];

  const handleRemoveCard = async (paymentMethodId: string) => {
    if (!window.confirm('Are you sure you want to remove this payment method?')) {
      return;
    }

    setRemovingCard(paymentMethodId);
    try {
      await detachPaymentMethod({
        variables: {
          input: {
            paymentMethodId,
          },
        },
      });
      refetchPaymentMethods();
      refetchCustomer();
    } catch (error) {
      console.error('Error removing payment method:', error);
      alert('Failed to remove payment method');
    } finally {
      setRemovingCard(null);
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      await setDefaultPaymentMethod({
        variables: {
          input: {
            paymentMethodId,
          },
        },
      });
      refetchCustomer();
    } catch (error) {
      console.error('Error setting default payment method:', error);
      alert('Failed to set default payment method');
    }
  };

  const handleAddCardSuccess = () => {
    refetchPaymentMethods();
    refetchCustomer();
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Billing & Payments</h2>
          <p className="text-gray-600">Manage your payment methods and view transaction history</p>
        </div>

        {/* Customer Info */}
        {customer && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Customer Information</h3>
            <p className="text-sm text-blue-700">
              Customer ID: {customer.id} | Email: {customer.email}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Transaction History
            </button>
            <button
              onClick={() => setActiveTab('payment-methods')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payment-methods'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Payment Methods
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'transactions' && (
          <TransactionHistory 
            transactions={transactions}
            loading={transactionsLoading}
          />
        )}

        {activeTab === 'payment-methods' && (
          <PaymentMethodsList
            paymentMethods={paymentMethods}
            loading={paymentMethodsLoading}
            removingCard={removingCard}
            onAddCard={() => setShowAddModal(true)}
            onRemoveCard={handleRemoveCard}
            onSetDefault={handleSetDefault}
          />
        )}

        {/* Add Payment Method Modal */}
        <AddPaymentMethodModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddCardSuccess}
        />
      </div>
    </Elements>
  );
};

export default BillingPanel; 