import Stripe from 'stripe';
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

export class StripeProvider implements PaymentProvider {
  readonly name = 'stripe';
  readonly displayName = 'Stripe';
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-06-30.basil',
    });
  }

  /**
   * Create a payment intent for a booking
   */
  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    try {
      const paymentIntentParams: any = {
        amount: params.amount,
        currency: params.currency || 'usd',
        metadata: params.metadata,
        receipt_email: params.customerEmail,
        description: params.description,
        automatic_payment_methods: {
          enabled: true,
        },
      };

      // Associate with customer if provided for better analytics
      if (params.customerId) {
        paymentIntentParams.customer = params.customerId;
        // This tells Stripe to save the payment method to the customer
        paymentIntentParams.setup_future_usage = 'on_session';
        console.log(`Creating payment intent for customer: ${params.customerId}`);
      }

      console.log('Stripe PaymentIntent params:', JSON.stringify(paymentIntentParams, null, 2));
      const paymentIntent = await this.stripe.paymentIntents.create(paymentIntentParams);
      console.log(`Created PaymentIntent: ${paymentIntent.id} for customer: ${paymentIntent.customer}`);

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  /**
   * Get or create a Stripe customer for a user
   */
  async getOrCreateCustomer(userId: string, email: string, name?: string): Promise<Customer> {
    try {
      // First, try to find existing customer by email
      const existingCustomers = await this.stripe.customers.list({
        email: email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        const customer = existingCustomers.data[0];
        return {
          id: customer.id,
          email: customer.email || email,
          name: customer.name || name,
          metadata: customer.metadata,
        };
      }

      // Create new customer if not found
      const customer = await this.stripe.customers.create({
        email: email,
        name: name,
        metadata: {
          userId: userId,
        },
      });

      return {
        id: customer.id,
        email: customer.email || email,
        name: customer.name || name,
        metadata: customer.metadata,
      };
    } catch (error) {
      console.error('Error getting/creating customer:', error);
      throw new Error('Failed to get or create customer');
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomer(customerId: string): Promise<Customer> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId) as Stripe.Customer;
      return {
        id: customer.id,
        email: customer.email || '',
        name: customer.name || undefined,
        metadata: customer.metadata,
      };
    } catch (error) {
      console.error('Error retrieving customer:', error);
      throw new Error('Failed to retrieve customer');
    }
  }

  /**
   * Get customer's payment methods
   */
  async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data.map(pm => ({
        id: pm.id,
        type: pm.type,
        card: pm.card ? {
          brand: pm.card.brand,
          last4: pm.card.last4,
          exp_month: pm.card.exp_month,
          exp_year: pm.card.exp_year,
          fingerprint: pm.card.fingerprint,
        } : undefined,
      }));
    } catch (error) {
      console.error('Error retrieving payment methods:', error);
      throw new Error('Failed to retrieve payment methods');
    }
  }

  /**
   * Attach a payment method to a customer
   */
  async attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      return {
        id: paymentMethod.id,
        type: paymentMethod.type,
        card: paymentMethod.card ? {
          brand: paymentMethod.card.brand,
          last4: paymentMethod.card.last4,
          exp_month: paymentMethod.card.exp_month,
          exp_year: paymentMethod.card.exp_year,
          fingerprint: paymentMethod.card.fingerprint,
        } : undefined,
      };
    } catch (error) {
      console.error('Error attaching payment method:', error);
      throw new Error('Failed to attach payment method');
    }
  }

  /**
   * Detach a payment method from a customer
   */
  async detachPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.detach(paymentMethodId);

      return {
        id: paymentMethod.id,
        type: paymentMethod.type,
        card: paymentMethod.card ? {
          brand: paymentMethod.card.brand,
          last4: paymentMethod.card.last4,
          exp_month: paymentMethod.card.exp_month,
          exp_year: paymentMethod.card.exp_year,
          fingerprint: paymentMethod.card.fingerprint,
        } : undefined,
      };
    } catch (error) {
      console.error('Error detaching payment method:', error);
      throw new Error('Failed to detach payment method');
    }
  }

  /**
   * Set default payment method for a customer
   */
  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<Customer> {
    try {
      const customer = await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      }) as Stripe.Customer;

      return {
        id: customer.id,
        email: customer.email || '',
        name: customer.name || undefined,
        metadata: customer.metadata,
      };
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw new Error('Failed to set default payment method');
    }
  }

  /**
   * Create a setup intent for adding payment methods
   */
  async createSetupIntent(customerId: string, returnUrl?: string): Promise<SetupIntentResult> {
    try {
      const setupIntent = await this.stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
        usage: 'off_session',
        return_url: returnUrl,
      });

      return {
        id: setupIntent.id,
        clientSecret: setupIntent.client_secret!,
        status: setupIntent.status,
      };
    } catch (error) {
      console.error('Error creating setup intent:', error);
      throw new Error('Failed to create setup intent');
    }
  }

  /**
   * Get customer's payment history
   */
  async getPaymentHistory(customerId: string, limit: number = 50): Promise<PaymentHistoryItem[]> {
    try {
      const charges = await this.stripe.charges.list({
        customer: customerId,
        limit: limit,
        expand: ['data.payment_intent'],
      });

      return charges.data.map(charge => ({
        id: charge.id,
        amount: charge.amount,
        currency: charge.currency,
        status: charge.status,
        description: charge.description || 'Payment',
        createdAt: new Date(charge.created * 1000).toISOString(),
        paymentMethod: charge.payment_method_details?.card ? {
          id: charge.payment_method as string,
          type: 'card',
          card: {
            brand: charge.payment_method_details.card.brand,
            last4: charge.payment_method_details.card.last4,
            exp_month: charge.payment_method_details.card.exp_month,
            exp_year: charge.payment_method_details.card.exp_year,
            fingerprint: charge.payment_method_details.card.fingerprint,
          },
        } : null,
      }));
    } catch (error) {
      console.error('Error retrieving payment history:', error);
      throw new Error('Failed to retrieve payment history');
    }
  }

  /**
   * Retrieve a payment intent
   */
  async getPaymentIntent(paymentIntentId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ['customer', 'payment_method']
      });
      console.log(`🔍 Retrieved PaymentIntent ${paymentIntentId}:`, {
        id: paymentIntent.id,
        status: paymentIntent.status,
        customer: paymentIntent.customer,
        payment_method: paymentIntent.payment_method,
        setup_future_usage: paymentIntent.setup_future_usage
      });
      return paymentIntent;
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      throw new Error('Failed to retrieve payment intent');
    }
  }

  /**
   * Confirm a payment intent
   */
  async confirmPaymentIntent(paymentIntentId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error confirming payment intent:', error);
      throw new Error('Failed to confirm payment intent');
    }
  }

  /**
   * Process webhook events
   */
  async processWebhook(payload: string, signature: string): Promise<WebhookEvent> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      return {
        id: event.id,
        type: event.type,
        data: event.data,
        created: event.created,
      };
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new Error('Invalid webhook signature');
    }
  }

  /**
   * Get payment intents for admin (with filters)
   */
  async getPaymentIntents(params: any = {}) {
    try {
      const paymentIntents = await this.stripe.paymentIntents.list({
        limit: params.limit || 50,
        created: params.created,
        customer: params.customer,
        expand: ['data.customer'], // Expand customer data
        ...params
      });

      console.log(`🔍 StripeProvider.getPaymentIntents retrieved ${paymentIntents.data.length} payment intents`);
      if (paymentIntents.data.length > 0) {
        console.log(`🔍 Sample payment intent customer:`, paymentIntents.data[0].customer);
      }

      return paymentIntents;
    } catch (error) {
      console.error('Error retrieving payment intents:', error);
      throw new Error('Failed to retrieve payment intents');
    }
  }

  /**
   * Get customers for admin
   */
  async getCustomers(params: any = {}) {
    try {
      const customers = await this.stripe.customers.list({
        limit: params.limit || 50,
        email: params.search,
        ...params
      });

      return customers;
    } catch (error) {
      console.error('Error retrieving customers:', error);
      throw new Error('Failed to retrieve customers');
    }
  }

  /**
   * Get invoices for a customer
   */
  async getInvoices(customerId: string) {
    try {
      const invoices = await this.stripe.invoices.list({
        customer: customerId,
        limit: 10
      });

      return invoices;
    } catch (error) {
      console.error('Error retrieving invoices:', error);
      throw new Error('Failed to retrieve invoices');
    }
  }

  /**
   * Get all invoices (admin)
   */
  async getAllInvoices(params: any = {}) {
    try {
      const invoices = await this.stripe.invoices.list({
        limit: params.limit || 50,
        ...params
      });

      return invoices;
    } catch (error) {
      console.error('Error retrieving all invoices:', error);
      throw new Error('Failed to retrieve invoices');
    }
  }
}

export default StripeProvider;