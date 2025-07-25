import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useMutation } from '@apollo/client';
import { CREATE_PAYMENT_INTENT, CREATE_BOOKING } from '../graphql/mutations';
import { VERIFY_PAYMENT_INTENT } from '../graphql/mutations/billing';
import Button from './ui/Button';
import { CreditCard, Lock, Shield } from 'lucide-react';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key');

interface PaymentFormProps {
  sessionId: string;
  sessionName: string;
  price: number;
  playerId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

// Stripe Elements styling
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

// Inner component that uses Stripe hooks
const CheckoutForm: React.FC<PaymentFormProps> = ({
  sessionId,
  sessionName,
  price,
  playerId,
  onSuccess,
  onError,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [createPaymentIntent] = useMutation(CREATE_PAYMENT_INTENT);
  const [createBooking] = useMutation(CREATE_BOOKING);
  const [verifyPaymentIntent] = useMutation(VERIFY_PAYMENT_INTENT);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    if (!stripe || !elements) {
      newErrors.general = 'Stripe failed to load';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!stripe || !elements) {
      onError('Stripe failed to load');
      return;
    }

    setLoading(true);

    // Debug logging
    console.log('PaymentForm - playerId:', playerId);
    console.log('PaymentForm - sessionId:', sessionId);
    console.log('PaymentForm - price:', price);

    try {
      // Step 1: Create payment intent
      const { data: paymentData } = await createPaymentIntent({
        variables: {
          input: {
            sessionId,
            price,
          },
        },
      });

      if (!paymentData?.createPaymentIntent) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = paymentData.createPaymentIntent;
      console.log('🔍 Full payment intent response:', JSON.stringify(paymentData.createPaymentIntent, null, 2));
      console.log('🔍 Client secret received:', clientSecret);

      // Step 2: Confirm payment with Stripe Elements
      // Use confirmCardPayment since we're using CardElement
      const { error: paymentError, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: cardholderName,
          },
        },
      });

      if (paymentError) {
        console.error('❌ Payment error:', paymentError);
        throw new Error(paymentError.message || 'Payment failed');
      }

      console.log('✅ Payment confirmed successfully!');
      console.log('🔍 Full confirmed PaymentIntent:', JSON.stringify(confirmedPaymentIntent, null, 2));
      console.log('📊 PaymentIntent ID:', confirmedPaymentIntent?.id);
      console.log('👤 Customer from confirmed PI:', confirmedPaymentIntent?.customer);
      console.log('💳 Payment Method:', confirmedPaymentIntent?.payment_method);

      // Backend verification: Check if payment is properly associated with customer
      if (confirmedPaymentIntent?.id) {
        console.log('🔍 Verifying payment-customer association on backend...');
        try {
          const { data: verificationData } = await verifyPaymentIntent({
            variables: {
              input: {
                paymentIntentId: confirmedPaymentIntent.id
              }
            }
          });
          
          console.log('✅ Backend verification result:', JSON.stringify(verificationData.verifyPaymentIntent, null, 2));
          if (verificationData.verifyPaymentIntent.customer) {
            console.log('🎉 SUCCESS: Payment properly associated with customer:', verificationData.verifyPaymentIntent.customer);
          } else {
            console.log('❌ ISSUE: No customer association found on backend');
          }
        } catch (error) {
          console.error('❌ Backend verification failed:', error);
        }
      }

      // Step 3: Create booking
      console.log('Creating booking with playerId:', playerId);
      const { data: bookingData } = await createBooking({
        variables: {
          input: {
            sessionId,
            price,
            playerId,
          },
        },
      });

      if (!bookingData?.createBooking) {
        throw new Error('Failed to create booking');
      }

      // Step 4: Success
      onSuccess();
    } catch (error: any) {
      console.error('Payment error:', error);
      onError(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-2">
          <CreditCard className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Complete Your Booking</h3>
        </div>
        <p className="text-sm text-gray-600">{sessionName}</p>
        <p className="text-2xl font-bold text-blue-600 mt-2">${price}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cardholder Name
          </label>
          <input
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.cardholderName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="John Doe"
            required
          />
          {errors.cardholderName && (
            <p className="text-red-500 text-xs mt-1">{errors.cardholderName}</p>
          )}
        </div>

        {/* Stripe Card Element */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Details
          </label>
          <div className="border border-gray-300 rounded-md p-3 focus-within:ring-2 focus-within:ring-blue-500">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {/* Test Card Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Test Mode</h4>
              <div className="mt-1 text-sm text-blue-700 space-y-1">
                <p>Use test card: <code className="bg-blue-100 px-1 rounded font-mono">4242 4242 4242 4242</code></p>
                <p>Any future expiry date (e.g., <code className="bg-blue-100 px-1 rounded">12/25</code>)</p>
                <p>Any 3-digit CVC (e.g., <code className="bg-blue-100 px-1 rounded">123</code>)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !stripe}
            loading={loading}
            className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
          >
            {loading ? 'Processing...' : `Pay $${price}`}
          </Button>
        </div>
      </form>

      {/* Security Notice */}
      <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
        <Lock className="h-3 w-3 mr-1" />
        Your payment is secured by Stripe
      </div>
    </div>
  );
};

// Wrapper component that provides Stripe Elements
const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default PaymentForm; 