import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { 
  useCreateSetupIntent,
  useAttachPaymentMethod
} from '../../services/graphqlService';
import Button from '../ui/Button';
import Error from '../ui/Error';
import Modal from '../ui/Modal';

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

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
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
        throw 'Failed to create setup intent';
      }

      const { clientSecret } = setupData.createSetupIntent;

      // Confirm setup intent
      const { error: setupError } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (setupError) {
        throw setupError.message || 'Failed to add payment method';
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
    } catch (error: unknown) {
      console.error('Error adding payment method:', error);
      setErrors({ general: typeof error === 'string' ? error : 'Failed to add payment method' });
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

        {errors.general && <Error message={errors.general as string} />}

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

export default AddPaymentMethodModal; 