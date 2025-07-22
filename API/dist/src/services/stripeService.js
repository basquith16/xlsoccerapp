import Stripe from 'stripe';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config({ path: './config.env' });
// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-06-30.basil',
});
export class StripeService {
    /**
     * Create a payment intent for a booking
     */
    static async createPaymentIntent(params) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: params.amount,
                currency: params.currency || 'usd',
                metadata: params.metadata,
                receipt_email: params.customerEmail,
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            return {
                id: paymentIntent.id,
                clientSecret: paymentIntent.client_secret,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
            };
        }
        catch (error) {
            console.error('Error creating payment intent:', error);
            throw new Error('Failed to create payment intent');
        }
    }
    /**
     * Get or create a Stripe customer for a user
     */
    static async getOrCreateCustomer(userId, email, name) {
        try {
            // First, try to find existing customer by email
            const existingCustomers = await stripe.customers.list({
                email: email,
                limit: 1,
            });
            if (existingCustomers.data.length > 0) {
                return existingCustomers.data[0];
            }
            // Create new customer if not found
            const customer = await stripe.customers.create({
                email: email,
                name: name,
                metadata: {
                    userId: userId,
                },
            });
            return customer;
        }
        catch (error) {
            console.error('Error getting/creating customer:', error);
            throw new Error('Failed to get or create customer');
        }
    }
    /**
     * Get customer by ID
     */
    static async getCustomer(customerId) {
        try {
            const customer = await stripe.customers.retrieve(customerId);
            return customer;
        }
        catch (error) {
            console.error('Error retrieving customer:', error);
            throw new Error('Failed to retrieve customer');
        }
    }
    /**
     * Get customer's payment methods
     */
    static async getPaymentMethods(customerId) {
        try {
            const paymentMethods = await stripe.paymentMethods.list({
                customer: customerId,
                type: 'card',
            });
            return paymentMethods.data;
        }
        catch (error) {
            console.error('Error retrieving payment methods:', error);
            throw new Error('Failed to retrieve payment methods');
        }
    }
    /**
     * Attach a payment method to a customer
     */
    static async attachPaymentMethod(paymentMethodId, customerId) {
        try {
            const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
                customer: customerId,
            });
            return paymentMethod;
        }
        catch (error) {
            console.error('Error attaching payment method:', error);
            throw new Error('Failed to attach payment method');
        }
    }
    /**
     * Detach a payment method from a customer
     */
    static async detachPaymentMethod(paymentMethodId) {
        try {
            const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
            return paymentMethod;
        }
        catch (error) {
            console.error('Error detaching payment method:', error);
            throw new Error('Failed to detach payment method');
        }
    }
    /**
     * Set default payment method for a customer
     */
    static async setDefaultPaymentMethod(customerId, paymentMethodId) {
        try {
            const customer = await stripe.customers.update(customerId, {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });
            return customer;
        }
        catch (error) {
            console.error('Error setting default payment method:', error);
            throw new Error('Failed to set default payment method');
        }
    }
    /**
     * Create a setup intent for adding payment methods
     */
    static async createSetupIntent(customerId, returnUrl) {
        try {
            const setupIntent = await stripe.setupIntents.create({
                customer: customerId,
                payment_method_types: ['card'],
                usage: 'off_session',
                return_url: returnUrl,
            });
            return {
                id: setupIntent.id,
                clientSecret: setupIntent.client_secret,
                status: setupIntent.status,
            };
        }
        catch (error) {
            console.error('Error creating setup intent:', error);
            throw new Error('Failed to create setup intent');
        }
    }
    /**
     * Get customer's payment history
     */
    static async getPaymentHistory(customerId, limit = 50) {
        try {
            const charges = await stripe.charges.list({
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
                    id: charge.payment_method,
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
        }
        catch (error) {
            console.error('Error retrieving payment history:', error);
            throw new Error('Failed to retrieve payment history');
        }
    }
    /**
     * Retrieve a payment intent
     */
    static async getPaymentIntent(paymentIntentId) {
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            return paymentIntent;
        }
        catch (error) {
            console.error('Error retrieving payment intent:', error);
            throw new Error('Failed to retrieve payment intent');
        }
    }
    /**
     * Confirm a payment intent
     */
    static async confirmPaymentIntent(paymentIntentId) {
        try {
            const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
            return paymentIntent;
        }
        catch (error) {
            console.error('Error confirming payment intent:', error);
            throw new Error('Failed to confirm payment intent');
        }
    }
    /**
     * Process webhook events
     */
    static async processWebhook(payload, signature) {
        try {
            const event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
            return event;
        }
        catch (error) {
            console.error('Webhook signature verification failed:', error);
            throw new Error('Invalid webhook signature');
        }
    }
}
export default StripeService;
