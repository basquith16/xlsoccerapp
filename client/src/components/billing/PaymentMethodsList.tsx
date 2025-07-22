import React from 'react';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Star,
  X
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

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

interface PaymentMethodsListProps {
  paymentMethods: PaymentMethod[];
  loading: boolean;
  removingCard: string | null;
  onAddCard: () => void;
  onRemoveCard: (paymentMethodId: string) => void;
  onSetDefault: (paymentMethodId: string) => void;
}

const PaymentMethodsList: React.FC<PaymentMethodsListProps> = ({
  paymentMethods,
  loading,
  removingCard,
  onAddCard,
  onRemoveCard,
  onSetDefault
}) => {
  const getCardIcon = (brand?: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading payment methods...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Payment Methods</h3>
          <Button onClick={onAddCard} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Card
          </Button>
        </div>

        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Methods</h3>
            <p className="text-gray-600 mb-4">Add a payment method to get started.</p>
            <Button onClick={onAddCard} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Card
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {getCardIcon(method.card?.brand)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {method.card?.brand?.toUpperCase()} •••• {method.card?.last4}
                    </p>
                    <p className="text-sm text-gray-500">
                      Expires {method.card?.exp_month}/{method.card?.exp_year}
                    </p>
                    {method.billingDetails?.name && (
                      <p className="text-sm text-gray-500">
                        {method.billingDetails.name}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => onSetDefault(method.id)}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800"
                    title="Set as default"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => onRemoveCard(method.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-800"
                    disabled={removingCard === method.id}
                    title="Remove card"
                  >
                    {removingCard === method.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default PaymentMethodsList; 