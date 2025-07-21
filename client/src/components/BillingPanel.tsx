import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Star, 
  Calendar, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { 
  useCustomer, 
  useTransactions, 
  usePaymentMethods,
  useCreateSetupIntent,
  useAttachPaymentMethod,
  useDetachPaymentMethod,
  useSetDefaultPaymentMethod
} from '../services/graphqlService';
import Button from './ui/Button';
import Card from './ui/Card';
import Loading from './ui/Loading';
import Error from './ui/Error';
import Modal from './ui/Modal';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key');

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand?: string;
    last4?: string;
    exp_month?: number;
    exp_year?: number;
    fingerprint?: string;
  };
  billingDetails?: {
    name?: string;
    email?: string;
  };
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  createdAt: string;
  paymentMethod?: {
    id: string;
    type: string;
    card?: {
      brand?: string;
      last4?: string;
      exp_month?: number;
      exp_year?: number;
    };
  };
}

const AddPaymentMethodModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ isOpen, onClose, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createSetupIntent] = useCreateSetupIntent();
  const [attachPaymentMethod] = useAttachPaymentMethod();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setErrors({ general: 'Stripe failed to load' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Create setup intent
      const { data: setupData } = await createSetupIntent({
        variables: {
          input: {
            returnUrl: window.location.href,
          },
        },
      });

      if (!setupData?.createSetupIntent) {
        throw new Error('Failed to create setup intent');
      }

      const { clientSecret } = setupData.createSetupIntent;

      // Confirm setup intent
      const { error: setupError } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (setupError) {
        throw new Error(setupError.message || 'Failed to add payment method');
      }

      // Attach payment method to customer
      await attachPaymentMethod({
        variables: {
          input: {
            paymentMethodId: setupData.createSetupIntent.id,
          },
        },
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error adding payment method:', error);
      setErrors({ general: error.message || 'Failed to add payment method' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Payment Method" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Details
          </label>
          <div className="border border-gray-300 rounded-md p-3 focus-within:ring-2 focus-within:ring-blue-500">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {errors.general && <Error message={errors.general} />}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !stripe} className="flex-1">
            {loading ? 'Adding...' : 'Add Card'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

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
          input: { paymentMethodId },
        },
      });
      refetchPaymentMethods();
      refetchCustomer();
    } catch (error: any) {
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
          input: { paymentMethodId },
        },
      });
      refetchCustomer();
    } catch (error: any) {
      console.error('Error setting default payment method:', error);
      alert('Failed to set default payment method');
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (customerLoading || transactionsLoading || paymentMethodsLoading) {
    return <Loading text="Loading billing information..." />;
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Billing & Payments</h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
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

      {/* Transaction History Tab */}
      {activeTab === 'transactions' && (
        <div>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No transactions yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction: Transaction) => (
                <div key={transaction.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(transaction.status)}
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(transaction.createdAt)}
                        </p>
                        {transaction.paymentMethod && transaction.paymentMethod.card && (
                          <p className="text-xs text-gray-400">
                            {transaction.paymentMethod.card.brand?.toUpperCase() || 'Unknown'} •••• {transaction.paymentMethod.card.last4 || '****'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatAmount(transaction.amount, transaction.currency)}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment Methods Tab */}
      {activeTab === 'payment-methods' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Saved Cards</h3>
            <Button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Card</span>
            </Button>
          </div>

          {paymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No payment methods saved.</p>
              <p className="text-sm text-gray-500">Add a payment method to make future purchases easier.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((method: PaymentMethod) => (
                <div key={method.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {method.card?.brand?.toUpperCase() || 'Unknown'} •••• {method.card?.last4 || '****'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Expires {method.card?.exp_month || '**'}/{method.card?.exp_year || '**'}
                        </p>
                        {method.billingDetails?.name && (
                          <p className="text-xs text-gray-400">{method.billingDetails.name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {customer?.defaultPaymentMethod?.id === method.id && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </span>
                      )}
                      {customer?.defaultPaymentMethod?.id !== method.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(method.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveCard(method.id)}
                        disabled={removingCard === method.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        {removingCard === method.id ? (
                          <Loading size="sm" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
          ))}
            </div>
          )}
        </div>
      )}

      {/* Add Payment Method Modal */}
      <Elements stripe={stripePromise}>
        <AddPaymentMethodModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            refetchPaymentMethods();
            refetchCustomer();
          }}
        />
      </Elements>
    </Card>
  );
};

export default BillingPanel; 