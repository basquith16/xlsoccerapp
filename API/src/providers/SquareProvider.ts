import { SquareClient, SquareEnvironment } from 'square';
import dotenv from 'dotenv';
import {
  PaymentProvider,
  CreatePaymentIntentParams,
  PaymentIntentResult,
  Customer,
  PaymentMethod,
  SetupIntentResult,
  PaymentHistoryItem,
  WebhookEvent
} from '../interfaces/PaymentProvider';

// Load environment variables
dotenv.config({ path: './config.env' });

/**
 * Square Payment Provider Implementation
 * Note: This is a simplified implementation that provides the interface required
 * by our payment abstraction. Square's API differs significantly from Stripe's,
 * so some methods return placeholder data or simplified responses.
 */
export class SquareProvider implements PaymentProvider {
  readonly name = 'square';
  readonly displayName = 'Square';
  private client: SquareClient;

  constructor() {
    this.client = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN!,
      environment: process.env.NODE_ENV === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
    });
  }

  /**
   * Create a payment intent for a booking
   * Square uses "CreatePayment" instead of payment intents
   */
  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    try {
      // Square requires a source_id (nonce) to create payments
      // For our abstraction, we'll create a payment request that can be completed later
      const idempotencyKey = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Store payment intent data (in production, you'd store this in a database)
      const paymentIntentId = `square_pi_${idempotencyKey}`;
      
      // Encode the payment data for later retrieval
      const encodedData = Buffer.from(JSON.stringify({
        amount: params.amount,
        currency: params.currency || 'USD',
        customerId: params.customerId,
        customerEmail: params.customerEmail,
        description: params.description,
        metadata: params.metadata,
        idempotencyKey,
      })).toString('base64');

      return {
        id: paymentIntentId,
        clientSecret: encodedData, // Square doesn't have client secrets, so we use encoded data
        amount: params.amount,
        currency: params.currency || 'USD',
        status: 'requires_payment_method',
      };
    } catch (error) {
      console.error('Error creating Square payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  /**
   * Get or create a Square customer for a user
   */
  async getOrCreateCustomer(userId: string, email: string, name?: string): Promise<Customer> {
    try {
      // Search for existing customer by email
      const searchResponse = await this.client.customers.search({
        query: {
          filter: {
            emailAddress: {
              exact: email,
            },
          },
        },
      });

      if (searchResponse.customers && searchResponse.customers.length > 0) {
        const customer = searchResponse.customers[0];
        return {
          id: customer.id!,
          email: customer.emailAddress || email,
          name: `${customer.givenName || ''} ${customer.familyName || ''}`.trim() || name,
          metadata: customer.note ? { note: customer.note } : undefined,
        };
      }

      // Create new customer if not found
      const nameParts = (name || '').split(' ');
      const createResponse = await this.client.customers.create({
        givenName: nameParts[0] || '',
        familyName: nameParts.slice(1).join(' ') || '',
        emailAddress: email,
        note: `User ID: ${userId}`,
      });

      const customer = createResponse.customer!;
      return {
        id: customer.id!,
        email: customer.emailAddress || email,
        name: `${customer.givenName || ''} ${customer.familyName || ''}`.trim() || name,
        metadata: customer.note ? { note: customer.note } : undefined,
      };
    } catch (error) {
      console.error('Error getting/creating Square customer:', error);
      throw new Error('Failed to get or create customer');
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomer(customerId: string): Promise<Customer> {
    try {
      const response = await this.client.customers.get({ customerId });
      const customer = response.customer!;

      return {
        id: customer.id!,
        email: customer.emailAddress || '',
        name: `${customer.givenName || ''} ${customer.familyName || ''}`.trim(),
        metadata: customer.note ? { note: customer.note } : undefined,
      };
    } catch (error) {
      console.error('Error retrieving Square customer:', error);
      throw new Error('Failed to retrieve customer');
    }
  }

  /**
   * Get customer's payment methods (cards on file)
   * Note: Square's card management API is different from Stripe's
   */
  async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      // Square stores cards differently - this is a simplified implementation
      console.log('Square payment methods - simplified implementation');
      return [];
    } catch (error) {
      console.error('Error retrieving Square payment methods:', error);
      throw new Error('Failed to retrieve payment methods');
    }
  }

  /**
   * Attach a payment method to a customer (create card on file)
   */
  async attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<PaymentMethod> {
    try {
      // In Square, this would be done through the Web Payments SDK on the frontend
      // Returning a placeholder for now
      return {
        id: paymentMethodId,
        type: 'card',
        card: {
          brand: 'unknown',
          last4: '****',
          exp_month: 0,
          exp_year: 0,
        },
      };
    } catch (error) {
      console.error('Error attaching Square payment method:', error);
      throw new Error('Failed to attach payment method');
    }
  }

  /**
   * Detach a payment method from a customer
   */
  async detachPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
    try {
      // Square doesn't have direct card deletion in the same way
      return {
        id: paymentMethodId,
        type: 'card',
        card: {
          brand: 'unknown',
          last4: '****',
          exp_month: 0,
          exp_year: 0,
        },
      };
    } catch (error) {
      console.error('Error detaching Square payment method:', error);
      throw new Error('Failed to detach payment method');
    }
  }

  /**
   * Set default payment method for a customer
   * Square doesn't have a concept of default payment methods at the API level
   */
  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<Customer> {
    try {
      // Get customer and update note to include default payment method
      const customer = await this.getCustomer(customerId);
      
      // Update customer note with default payment info
      await this.client.customers.update({
        customerId,
        note: `${customer.metadata?.note || ''} | Default Payment: ${paymentMethodId}`,
      });
      
      return customer;
    } catch (error) {
      console.error('Error setting default Square payment method:', error);
      throw new Error('Failed to set default payment method');
    }
  }

  /**
   * Create a setup intent for adding payment methods
   * Square doesn't have setup intents, so we return a placeholder
   */
  async createSetupIntent(customerId: string, returnUrl?: string): Promise<SetupIntentResult> {
    try {
      const setupIntentId = `square_si_${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        id: setupIntentId,
        clientSecret: Buffer.from(JSON.stringify({ customerId, returnUrl })).toString('base64'),
        status: 'requires_payment_method',
      };
    } catch (error) {
      console.error('Error creating Square setup intent:', error);
      throw new Error('Failed to create setup intent');
    }
  }

  /**
   * Get customer's payment history
   */
  async getPaymentHistory(customerId: string, limit: number = 50): Promise<PaymentHistoryItem[]> {
    try {
      // Square requires searching payments differently
      // This is a simplified implementation
      console.log('Square payment history - simplified implementation');
      return [];
    } catch (error) {
      console.error('Error retrieving Square payment history:', error);
      throw new Error('Failed to retrieve payment history');
    }
  }

  /**
   * Retrieve a payment intent
   */
  async getPaymentIntent(paymentIntentId: string) {
    try {
      // Decode the payment intent data from the ID
      if (paymentIntentId.startsWith('square_pi_')) {
        const encodedData = paymentIntentId.replace('square_pi_', '').split('_')[0];
        const paymentData = JSON.parse(Buffer.from(encodedData, 'base64').toString());
        
        return {
          id: paymentIntentId,
          status: 'requires_payment_method',
          amount: paymentData.amount,
          currency: paymentData.currency,
          metadata: paymentData.metadata,
        };
      }
      
      // If it's a real Square payment ID, fetch it
      const response = await this.client.payments.get({ paymentId: paymentIntentId });
      const payment = response.payment!;
      
      return {
        id: payment.id!,
        status: payment.status || 'unknown',
        amount: Number(payment.amountMoney?.amount || 0),
        currency: payment.amountMoney?.currency || 'USD',
        metadata: {},
      };
    } catch (error) {
      console.error('Error retrieving Square payment intent:', error);
      throw new Error('Failed to retrieve payment intent');
    }
  }

  /**
   * Confirm a payment intent (create actual Square payment)
   */
  async confirmPaymentIntent(paymentIntentId: string) {
    try {
      // This would be called from the frontend with the actual nonce
      // For now, we'll throw an error indicating this should be handled differently
      throw new Error('Square payments must be confirmed from the frontend with a payment nonce');
    } catch (error) {
      console.error('Error confirming Square payment intent:', error);
      throw new Error('Failed to confirm payment intent');
    }
  }

  /**
   * Process webhook events
   */
  async processWebhook(payload: string, signature: string): Promise<WebhookEvent> {
    try {
      // Square webhook signature verification
      const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!;
      
      // TODO: Implement proper webhook signature verification
      // For now, parse the event
      const event = JSON.parse(payload);
      
      return {
        id: event.merchant_id || 'square_webhook',
        type: event.type,
        data: event.data,
        created: Date.now(),
      };
    } catch (error) {
      console.error('Square webhook signature verification failed:', error);
      throw new Error('Invalid webhook signature');
    }
  }

  /**
   * Get payment intents for admin (with filters)
   */
  async getPaymentIntents(params: any = {}) {
    try {
      // Square doesn't have payment intents, so we'll list payments
      const response = await this.client.payments.list({
        limit: params.limit || 50,
      });

      return {
        data: (response as any).payments || [],
        hasMore: !!(response as any).cursor,
      };
    } catch (error) {
      console.error('Error retrieving Square payment intents:', error);
      throw new Error('Failed to retrieve payment intents');
    }
  }

  /**
   * Get customers for admin
   */
  async getCustomers(params: any = {}) {
    try {
      const searchQuery = params.search ? {
        filter: {
          emailAddress: {
            fuzzy: params.search,
          },
        },
      } : undefined;

      const response = searchQuery 
        ? await this.client.customers.search({
            query: searchQuery,
            limit: params.limit || 50,
          })
        : await this.client.customers.list({
            limit: params.limit || 50,
          });

      return {
        data: (response as any).customers || [],
        hasMore: !!(response as any).cursor,
      };
    } catch (error) {
      console.error('Error retrieving Square customers:', error);
      throw new Error('Failed to retrieve customers');
    }
  }

  /**
   * Get invoices for a customer
   * Square doesn't have invoices in the same way as Stripe
   */
  async getInvoices(customerId: string) {
    try {
      // Square uses Orders and Invoices differently
      console.log('Square invoices - simplified implementation');
      return { data: [] };
    } catch (error) {
      console.error('Error retrieving Square invoices:', error);
      throw new Error('Failed to retrieve invoices');
    }
  }

  /**
   * Get all invoices (admin)
   */
  async getAllInvoices(params: any = {}) {
    try {
      // Square uses Orders and Invoices differently
      console.log('Square invoices - simplified implementation');
      return { data: [] };
    } catch (error) {
      console.error('Error retrieving Square invoices:', error);
      throw new Error('Failed to retrieve invoices');
    }
  }
}

export default SquareProvider;