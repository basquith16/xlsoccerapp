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
