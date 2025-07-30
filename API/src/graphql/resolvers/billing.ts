import StripeService from '../../services/stripeService';
import { paymentProviderService } from '../../services/PaymentProviderService';
import { IUser } from '../../types/models';
import { validateObjectId } from '../../utils/validation';
import Session from '../../models/sessionModel';
import Booking from '../../models/bookingModel';

console.log('🔥 BILLING RESOLVER LOADED WITH createPaymentIntent');

export const billingResolvers = {
  Query: {
    // Admin billing analytics
    billingAnalytics: async (_: unknown, { timeRange }: { timeRange: string }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      try {
        console.log(`🔍 Fetching billing analytics for timeRange: ${timeRange}`);
        
        // Get all payment intents for the specified time range
        const payments = await StripeService.getPaymentIntents({ 
          created: { gte: Math.floor(Date.now() / 1000) - (timeRange === '30d' ? 30 * 24 * 3600 : 7 * 24 * 3600) } 
        });

        console.log(`🔍 Found ${payments.data.length} total payments in time range`);
        
        const successfulPayments = payments.data.filter(p => p.status === 'succeeded');
        console.log(`🔍 Found ${successfulPayments.length} successful payments`);
        
        const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0) / 100;
        const totalTransactions = successfulPayments.length;
        
        // Fix customer counting - handle both string IDs and expanded customer objects
        const customerIds = successfulPayments
          .map(p => {
            // Handle both expanded customer objects and plain customer ID strings
            if (typeof p.customer === 'string') {
              return p.customer;
            } else if (p.customer && typeof p.customer === 'object' && p.customer.id) {
              return p.customer.id;
            }
            return null;
          })
          .filter(customerId => customerId && customerId !== null);
        const activeCustomers = new Set(customerIds).size;
        
        console.log(`🔍 Customer IDs found: ${customerIds.length}, Unique customers: ${activeCustomers}`);
        console.log(`🔍 Sample customer IDs:`, customerIds.slice(0, 3));
        
        const averageOrderValue = totalRevenue / totalTransactions || 0;

        // Calculate revenue by month (simplified for demo)
        const revenueByMonth = [
          { month: 'Jan', revenue: totalRevenue * 0.8, transactions: Math.floor(totalTransactions * 0.8) },
          { month: 'Feb', revenue: totalRevenue * 0.9, transactions: Math.floor(totalTransactions * 0.9) },
          { month: 'Mar', revenue: totalRevenue, transactions: totalTransactions }
        ];

        return {
          totalRevenue,
          totalTransactions,
          activeCustomers,
          averageOrderValue,
          revenueChange: 12.5,
          transactionChange: 8.3,
          customerChange: 15.2,
          averageOrderChange: -2.1,
          periodComparison: `vs previous ${timeRange}`,
          revenueByMonth,
          paymentMethodBreakdown: [
            { method: 'Card', percentage: 85, amount: totalRevenue * 0.85 },
            { method: 'Bank Transfer', percentage: 15, amount: totalRevenue * 0.15 }
          ],
          topSessions: [
            { name: 'Youth Training', revenue: totalRevenue * 0.4, bookings: Math.floor(totalTransactions * 0.4) },
            { name: 'Adult League', revenue: totalRevenue * 0.3, bookings: Math.floor(totalTransactions * 0.3) }
          ]
        };
      } catch (error) {
        console.error('Error fetching billing analytics:', error);
        throw new Error('Failed to fetch billing analytics');
      }
    },

    // Admin transactions with pagination and filtering
    adminTransactions: async (_: unknown, args: any, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      try {
        const { limit = 20, offset = 0, search, status, startDate, endDate } = args;
        
        const queryParams: any = { limit };
        if (search) queryParams.customer = search;
        if (status) queryParams.status = status;
        if (startDate) queryParams.created = { gte: Math.floor(new Date(startDate).getTime() / 1000) };
        if (endDate) queryParams.created = { ...queryParams.created, lte: Math.floor(new Date(endDate).getTime() / 1000) };

        const payments = await StripeService.getPaymentIntents(queryParams);
        
        const nodes = await Promise.all(payments.data.map(async (payment: any) => {
          // Since we're expanding customer data, payment.customer is already the full object
          const customer = payment.customer && !payment.customer.deleted ? payment.customer : null;
          
          return {
            id: payment.id,
            amount: payment.amount / 100,
            currency: payment.currency.toUpperCase(),
            status: payment.status,
            description: payment.description || '',
            createdAt: new Date(payment.created * 1000).toISOString(),
            fees: (payment.application_fee_amount || 0) / 100,
            netAmount: (payment.amount - (payment.application_fee_amount || 0)) / 100,
            refunded: payment.amount_refunded > 0,
            disputed: false, // Would need to check disputes separately
            customer: customer && !customer.deleted ? {
              id: customer.id,
              name: (customer as any).name || (customer as any).email,
              email: (customer as any).email
            } : null,
            paymentMethod: payment.payment_method ? {
              id: payment.payment_method,
              type: 'card',
              card: { brand: 'visa', last4: '4242' } // Simplified
            } : null,
            session: null, // Would need to link to session data
            stripePaymentIntentId: payment.id
          };
        }));

        return {
          nodes,
          totalCount: payments.data.length,
          hasNextPage: payments.has_more
        };
      } catch (error) {
        console.error('Error fetching admin transactions:', error);
        throw new Error('Failed to fetch admin transactions');
      }
    },

    // Admin customers with billing info
    adminCustomers: async (_: unknown, args: any, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      try {
        const { limit = 20, offset = 0, search, status, riskLevel } = args;
        
        const customers = await StripeService.getCustomers({ limit, search });
        
        if (!customers?.data) {
          return {
            nodes: [],
            totalCount: 0,
            hasNextPage: false
          };
        }
        
        const nodes = await Promise.all(customers.data.map(async (customer: any) => {
          const paymentMethods = await StripeService.getPaymentMethods(customer.id);
          const invoices = await StripeService.getInvoices(customer.id);
          
          const totalSpent = invoices?.data ? invoices.data.reduce((sum: number, inv: any) => sum + (inv.amount_paid / 100), 0) : 0;
          
          return {
            id: customer.id,
            email: customer.email,
            name: customer.name || customer.email,
            phone: customer.phone,
            createdAt: new Date(customer.created * 1000).toISOString(),
            billing: {
              totalSpent,
              lastPaymentDate: invoices?.data?.[0] ? new Date(invoices.data[0].created * 1000).toISOString() : null,
              subscriptionCount: 0, // Would need to fetch subscriptions
              paymentMethodCount: paymentMethods?.length || 0,
              defaultPaymentMethodId: customer.invoice_settings?.default_payment_method,
              status: 'active',
              riskLevel: 'low'
            },
            paymentMethods: paymentMethods?.map((pm: any) => ({
              id: pm.id,
              type: pm.type,
              card: pm.card ? {
                brand: pm.card.brand,
                last4: pm.card.last4,
                exp_month: pm.card.exp_month,
                exp_year: pm.card.exp_year
              } : null,
              isDefault: pm.id === customer.invoice_settings?.default_payment_method
            })) || []
          };
        }));

        return {
          nodes,
          totalCount: customers.data.length,
          hasNextPage: customers.has_more
        };
      } catch (error) {
        console.error('Error fetching admin customers:', error);
        throw new Error('Failed to fetch admin customers');
      }
    },
    customer: async (_: unknown, __: unknown, { user }: { user: IUser | null }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      try {
        const customer = await StripeService.getOrCreateCustomer(
          user._id.toString(),
          user.email,
          user.name
        );

        const paymentMethods = await StripeService.getPaymentMethods(customer.id);

        return {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          paymentMethods: paymentMethods.map(pm => ({
            id: pm.id,
            type: pm.type,
            card: pm.card ? {
              id: pm.card.fingerprint || `card_${pm.id}`,
              brand: pm.card.brand,
              last4: pm.card.last4,
              expMonth: pm.card.exp_month,
              expYear: pm.card.exp_year,
              fingerprint: pm.card.fingerprint,
            } : null,
            billingDetails: pm.billing_details ? {
              id: `billing_${pm.id}`,
              name: pm.billing_details.name,
              email: pm.billing_details.email,
              address: pm.billing_details.address ? {
                line1: pm.billing_details.address.line1,
                line2: pm.billing_details.address.line2,
                city: pm.billing_details.address.city,
                state: pm.billing_details.address.state,
                postalCode: pm.billing_details.address.postal_code,
                country: pm.billing_details.address.country,
              } : null,
            } : null,
          })),
          defaultPaymentMethod: customer.invoice_settings?.default_payment_method ? {
            id: customer.invoice_settings.default_payment_method,
            type: 'card',
          } : null,
        };
      } catch (error) {
        console.error('Error fetching customer:', error);
        throw new Error('Failed to fetch customer information');
      }
    },

    transactions: async (_: unknown, __: unknown, { user }: { user: IUser | null }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      try {
        const customer = await StripeService.getOrCreateCustomer(
          user._id.toString(),
          user.email,
          user.name
        );

        const transactions = await StripeService.getPaymentHistory(customer.id);
        return transactions;
      } catch (error) {
        console.error('Error fetching transactions:', error);
        throw new Error('Failed to fetch transaction history');
      }
    },

    paymentMethods: async (_: unknown, __: unknown, { user }: { user: IUser | null }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      try {
        const customer = await StripeService.getOrCreateCustomer(
          user._id.toString(),
          user.email,
          user.name
        );

        const paymentMethods = await StripeService.getPaymentMethods(customer.id);

        return paymentMethods.map(pm => ({
          id: pm.id,
          type: pm.type,
          card: pm.card ? {
            id: pm.card.fingerprint || `card_${pm.id}`,
            brand: pm.card.brand,
            last4: pm.card.last4,
            exp_month: pm.card.exp_month,
            exp_year: pm.card.exp_year,
            fingerprint: pm.card.fingerprint,
          } : null,
          billingDetails: pm.billing_details ? {
            id: `billing_${pm.id}`,
            name: pm.billing_details.name,
            email: pm.billing_details.email,
            address: pm.billing_details.address ? {
              line1: pm.billing_details.address.line1,
              line2: pm.billing_details.address.line2,
              city: pm.billing_details.address.city,
              state: pm.billing_details.address.state,
              postalCode: pm.billing_details.address.postal_code,
              country: pm.billing_details.address.country,
            } : null,
          } : null,
        }));
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        throw new Error('Failed to fetch payment methods');
      }
    },

    // Payment provider management
    billingConfiguration: async (_: unknown, __: unknown, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      try {
        const providers = paymentProviderService.getAvailableProviders();
        const activeProvider = await paymentProviderService.getActiveProvider();

        return {
          activeProvider: activeProvider.name,
          providers: providers.map(config => {
            // Check if this provider is the currently active one
            const isCurrentlyActive = activeProvider.name === config.type.toLowerCase();
            
            // Check if provider has proper credentials configured
            let hasCredentials = false;
            
            if (config.type === 'stripe') {
              hasCredentials = !!process.env.STRIPE_SECRET_KEY;
            } else if (config.type === 'square') {
              hasCredentials = !!process.env.SQUARE_ACCESS_TOKEN;
            }
            
            // Only show as connected if it's the currently active provider AND has credentials
            const isConnected = hasCredentials && isCurrentlyActive;
            
            console.log(`🔍 ${config.type} status:`, {
              hasCredentials,
              isCurrentlyActive,
              activeProviderName: activeProvider.name,
              configType: config.type.toLowerCase(),
              isConnected
            });
            
            return {
              type: config.type,
              name: config.type.toLowerCase(),
              displayName: config.type.charAt(0).toUpperCase() + config.type.slice(1).toLowerCase(),
              isActive: isCurrentlyActive,
              isDefault: config.isDefault,
              isConnected: isConnected,
              config: {
                publicKey: config.config?.publicKey || null,
                environment: process.env.NODE_ENV || 'development'
              }
            };
          }),
          stripe: {
            isConnected: !!(process.env.STRIPE_SECRET_KEY && paymentProviderService.getProviderConfig('stripe')?.isActive),
            accountId: process.env.STRIPE_SECRET_KEY?.substring(0, 20) + '...' || null,
            defaultCurrency: 'USD'
          },
          square: {
            isConnected: !!(process.env.SQUARE_ACCESS_TOKEN && paymentProviderService.getProviderConfig('square')?.isActive),
            accountId: process.env.SQUARE_ACCESS_TOKEN?.substring(0, 20) + '...' || null,
            environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
          },
          paymentMethods: {
            cards: true,
            applePay: true,
            googlePay: true,
            bankTransfer: false
          },
          fees: {
            processingFeePercentage: 2.9,
            fixedFeeAmount: 0.30,
            taxRate: 8.5
          },
          policies: {
            refundPolicy: 'flexible',
            refundWindowHours: 24,
            latePaymentFee: 5.00
          },
          notifications: {
            paymentSuccess: true,
            paymentFailed: true,
            refundProcessed: true,
            disputeCreated: true
          },
          security: {
            requireCVV: true,
            enable3DSecure: true,
            fraudDetection: true
          }
        };
      } catch (error) {
        console.error('Error fetching billing configuration:', error);
        throw new Error('Failed to fetch billing configuration');
      }
    },

    paymentProviders: async (_: unknown, __: unknown, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      try {
        const providers = paymentProviderService.getAvailableProviders();
        
        return providers.map(config => ({
          type: config.type,
          name: config.type.toLowerCase(),
          displayName: config.type.charAt(0).toUpperCase() + config.type.slice(1).toLowerCase(),
          isActive: config.isActive,
          isDefault: config.isDefault,
          isConnected: config.isActive, // For now, assume active means connected
          config: {
            publicKey: config.config?.publicKey || null,
            environment: process.env.NODE_ENV || 'development'
          },
          metrics: paymentProviderService.getProviderMetrics(config.type)
        }));
      } catch (error) {
        console.error('Error fetching payment providers:', error);
        throw new Error('Failed to fetch payment providers');
      }
    },

    paymentProviderMetrics: async (_: unknown, { providerType }: { providerType: string }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      try {
        const metrics = paymentProviderService.getProviderMetrics(providerType);
        
        return {
          ...metrics,
          totalTransactions: 0, // Would be fetched from database
          totalVolume: 0, // Would be fetched from database
          averageTransactionValue: 0, // Would be calculated
          lastConnectionTest: new Date().toISOString()
        };
      } catch (error) {
        console.error('Error fetching payment provider metrics:', error);
        throw new Error('Failed to fetch payment provider metrics');
      }
    },

    // Admin refunds and disputes
    refundsDisputes: async (_: unknown, args: any, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      try {
        const { limit = 20, offset = 0, type, status } = args;
        
        // In a real implementation, this would fetch from Stripe's disputes and refunds APIs
        // For now, return empty data structure that matches the GraphQL schema
        const nodes: any[] = [];
        
        // Example of how you could fetch real data from Stripe:
        // const refunds = await StripeService.stripe.refunds.list({ limit });
        // const disputes = await StripeService.stripe.disputes.list({ limit });
        // 
        // nodes = [...refunds.data.map(refund => ({
        //   id: refund.id,
        //   type: 'refund',
        //   amount: refund.amount / 100,
        //   currency: refund.currency.toUpperCase(),
        //   reason: refund.reason || 'No reason provided',
        //   status: refund.status,
        //   createdAt: new Date(refund.created * 1000).toISOString(),
        //   updatedAt: new Date(refund.created * 1000).toISOString(),
        //   description: refund.metadata?.description || null,
        //   transaction: {
        //     id: refund.payment_intent,
        //     amount: refund.amount / 100,
        //     createdAt: new Date(refund.created * 1000).toISOString()
        //   },
        //   customer: {
        //     id: 'customer_id',
        //     name: 'Customer Name',
        //     email: 'customer@email.com'
        //   }
        // })), ...disputes.data.map(dispute => ({ ... }))];
        
        return {
          nodes,
          totalCount: 0,
          hasNextPage: false,
          summary: {
            totalRefunds: 0,
            totalDisputes: 0,
            pendingCount: 0,
            totalAmount: 0
          }
        };
      } catch (error) {
        console.error('Error fetching refunds and disputes:', error);
        throw new Error('Failed to fetch refunds and disputes');
      }
    }
  },

  Mutation: {
    createPaymentIntent: async (_: unknown, { input }: { input: any }, { user }: { user: IUser | null }) => {
      console.log('=== BILLING RESOLVER createPaymentIntent CALLED ===');
      console.log('Input:', JSON.stringify(input, null, 2));
      console.log('User:', user?.email);
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { sessionId, price } = input;

      // Validate input - using the same validation as the working version
      if (!validateObjectId(sessionId)) {
        throw new Error('Invalid session ID format');
      }

      if (!price || price <= 0) {
        throw new Error('Invalid price');
      }

      // Check if session exists
      const session = await Session.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Check if user already has a booking for this session
      const existingBooking = await Booking.findOne({
        user: user._id,
        session: sessionId
      });

      if (existingBooking) {
        throw new Error('You already have a booking for this session');
      }

      // Convert price to cents for payment providers
      const amountInCents = Math.round(price * 100);

      // Get active payment provider
      const provider = await paymentProviderService.getActiveProvider();
      console.log(`Using payment provider: ${provider.name}`);

      // Create or get customer for better analytics and payment tracking
      const customer = await provider.getOrCreateCustomer(
        user._id.toString(),
        user.email,
        user.name
      );
      console.log(`${provider.displayName} customer for payment: ${customer.id} (${user.email})`);

      // Create payment intent using the active provider
      const paymentIntent = await provider.createPaymentIntent({
        amount: amountInCents,
        currency: 'usd',
        customerId: customer.id,
        description: `Session: ${session.name}`,
        metadata: {
          sessionId,
          userId: user._id.toString(),
          sessionName: session.name,
          customerId: customer.id,
          provider: provider.name,
        },
        customerEmail: user.email,
      });

      console.log('🔄 Returning payment intent to frontend:', JSON.stringify(paymentIntent, null, 2));
      return paymentIntent;
    },

    verifyPaymentIntent: async (_: unknown, { input }: { input: any }, { user }: { user: IUser | null }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { paymentIntentId } = input;
      if (!paymentIntentId) {
        throw new Error('Payment Intent ID is required');
      }

      try {
        console.log(`🔍 Verifying PaymentIntent ${paymentIntentId} for user ${user.email}`);
        const paymentIntent = await StripeService.getPaymentIntent(paymentIntentId);
        
        return {
          id: paymentIntent.id,
          status: paymentIntent.status,
          customer: typeof paymentIntent.customer === 'object' && paymentIntent.customer?.id 
            ? paymentIntent.customer.id 
            : paymentIntent.customer as string,
          amount: paymentIntent.amount,
          paymentMethod: typeof paymentIntent.payment_method === 'object' && paymentIntent.payment_method?.id
            ? paymentIntent.payment_method.id
            : paymentIntent.payment_method as string,
          setupFutureUsage: paymentIntent.setup_future_usage,
        };
      } catch (error) {
        console.error('Error verifying payment intent:', error);
        throw new Error('Failed to verify payment intent');
      }
    },

    createSetupIntent: async (_: unknown, { input }: { input: any }, { user }: { user: IUser | null }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      try {
        const customer = await StripeService.getOrCreateCustomer(
          user._id.toString(),
          user.email,
          user.name
        );

        const setupIntent = await StripeService.createSetupIntent(
          customer.id,
          input.returnUrl
        );

        return setupIntent;
      } catch (error) {
        console.error('Error creating setup intent:', error);
        throw new Error('Failed to create setup intent');
      }
    },

    attachPaymentMethod: async (_: unknown, { input }: { input: any }, { user }: { user: IUser | null }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { paymentMethodId } = input;

      try {
        const customer = await StripeService.getOrCreateCustomer(
          user._id.toString(),
          user.email,
          user.name
        );

        const paymentMethod = await StripeService.attachPaymentMethod(paymentMethodId, customer.id);

        return {
          id: paymentMethod.id,
          type: paymentMethod.type,
          card: paymentMethod.card ? {
            id: paymentMethod.card.fingerprint || `card_${paymentMethod.id}`,
            brand: paymentMethod.card.brand,
            last4: paymentMethod.card.last4,
            exp_month: paymentMethod.card.exp_month,
            exp_year: paymentMethod.card.exp_year,
            fingerprint: paymentMethod.card.fingerprint,
          } : null,
          billingDetails: paymentMethod.billing_details ? {
            id: `billing_${paymentMethod.id}`,
            name: paymentMethod.billing_details.name,
            email: paymentMethod.billing_details.email,
            address: paymentMethod.billing_details.address ? {
              line1: paymentMethod.billing_details.address.line1,
              line2: paymentMethod.billing_details.address.line2,
              city: paymentMethod.billing_details.address.city,
              state: paymentMethod.billing_details.address.state,
              postalCode: paymentMethod.billing_details.address.postal_code,
              country: paymentMethod.billing_details.address.country,
            } : null,
          } : null,
        };
      } catch (error) {
        console.error('Error attaching payment method:', error);
        throw new Error('Failed to attach payment method');
      }
    },

    detachPaymentMethod: async (_: unknown, { input }: { input: any }, { user }: { user: IUser | null }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { paymentMethodId } = input;

      try {
        await StripeService.detachPaymentMethod(paymentMethodId);
        return 'Payment method removed successfully';
      } catch (error) {
        console.error('Error detaching payment method:', error);
        throw new Error('Failed to remove payment method');
      }
    },

    setDefaultPaymentMethod: async (_: unknown, { input }: { input: any }, { user }: { user: IUser | null }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { paymentMethodId } = input;

      try {
        const customer = await StripeService.getOrCreateCustomer(
          user._id.toString(),
          user.email,
          user.name
        );

        const updatedCustomer = await StripeService.setDefaultPaymentMethod(customer.id, paymentMethodId);

        return {
          id: updatedCustomer.id,
          email: updatedCustomer.email,
          name: updatedCustomer.name,
          paymentMethods: [],
          defaultPaymentMethod: {
            id: paymentMethodId,
            type: 'card',
          },
        };
      } catch (error) {
        console.error('Error setting default payment method:', error);
        throw new Error('Failed to set default payment method');
      }
    },

    // Generate financial report
    generateFinancialReport: async (_: unknown, { input }: { input: any }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      try {
        const { reportType, startDate, endDate, format } = input;
        
        // In a real implementation, this would:
        // 1. Generate the actual report using Stripe data
        // 2. Save it to a file storage service (S3, etc.)
        // 3. Return a download URL with expiration
        // 4. Possibly queue the generation for large reports
        
        // For now, return a mock response
        const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now
        
        return {
          reportId,
          status: 'completed',
          downloadUrl: `https://your-app.com/api/reports/${reportId}/download`,
          expiresAt
        };
      } catch (error) {
        console.error('Error generating financial report:', error);
        throw new Error('Failed to generate financial report');
      }
    },

    // Payment provider management mutations
    setActivePaymentProvider: async (_: unknown, { providerType }: { providerType: string }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      try {
        await paymentProviderService.setActiveProvider(providerType as any);
        
        return {
          success: true,
          message: `Successfully switched to ${providerType} provider`,
          activeProvider: providerType
        };
      } catch (error) {
        console.error('Error setting active payment provider:', error);
        return {
          success: false,
          message: `Failed to switch to ${providerType}: ${error.message}`,
          activeProvider: null
        };
      }
    },

    updatePaymentProviderConfig: async (_: unknown, { input }: { input: any }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      try {
        const { providerType, config } = input;
        
        paymentProviderService.updateProviderConfig(providerType, config);
        const updatedConfig = paymentProviderService.getProviderConfig(providerType);
        
        return {
          success: true,
          message: `Successfully updated ${providerType} configuration`,
          provider: {
            type: updatedConfig?.type,
            name: updatedConfig?.type.toLowerCase(),
            displayName: updatedConfig?.type.charAt(0).toUpperCase() + updatedConfig?.type.slice(1).toLowerCase(),
            isActive: updatedConfig?.isActive,
            isDefault: updatedConfig?.isDefault,
            isConnected: updatedConfig?.isActive,
            config: {
              publicKey: updatedConfig?.config?.publicKey || null,
              environment: process.env.NODE_ENV || 'development'
            }
          }
        };
      } catch (error) {
        console.error('Error updating payment provider config:', error);
        return {
          success: false,
          message: `Failed to update ${input.providerType} configuration: ${error.message}`,
          provider: null
        };
      }
    },

    testPaymentProviderConnection: async (_: unknown, { providerType }: { providerType: string }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      try {
        const startTime = Date.now();
        
        // Test provider connection
        const isAvailable = await paymentProviderService.isProviderAvailable(providerType as any);
        
        const responseTime = Date.now() - startTime;
        
        if (isAvailable) {
          return {
            success: true,
            message: `${providerType} connection test successful`,
            connectionStatus: 'connected',
            responseTime
          };
        } else {
          return {
            success: false,
            message: `${providerType} connection test failed`,
            connectionStatus: 'disconnected',
            responseTime
          };
        }
      } catch (error) {
        console.error('Error testing payment provider connection:', error);
        return {
          success: false,
          message: `Connection test failed: ${error.message}`,
          connectionStatus: 'error',
          responseTime: 0
        };
      }
    },

    updateBillingConfiguration: async (_: unknown, { input }: { input: any }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      try {
        // In a real implementation, this would save the configuration to a database
        console.log('Updating billing configuration:', input);
        
        // For now, we'll just return success and the current configuration
        const providers = paymentProviderService.getAvailableProviders();
        const activeProvider = await paymentProviderService.getActiveProvider();
        
        return {
          success: true,
          message: 'Billing configuration updated successfully',
          configuration: {
            activeProvider: activeProvider.name,
            providers: providers.map(config => ({
              type: config.type,
              name: config.type.toLowerCase(),
              displayName: config.type.charAt(0).toUpperCase() + config.type.slice(1).toLowerCase(),
              isActive: config.isActive,
              isDefault: config.isDefault,
              isConnected: config.isActive
            })),
            stripe: {
              isConnected: !!(process.env.STRIPE_SECRET_KEY && paymentProviderService.getProviderConfig('stripe')?.isActive),
              accountId: process.env.STRIPE_SECRET_KEY?.substring(0, 20) + '...' || null,
              defaultCurrency: 'USD'
            },
            square: {
              isConnected: !!(process.env.SQUARE_ACCESS_TOKEN && paymentProviderService.getProviderConfig('square')?.isActive),
              accountId: process.env.SQUARE_ACCESS_TOKEN?.substring(0, 20) + '...' || null,
              environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
            },
            paymentMethods: input.paymentMethods || {
              cards: true,
              applePay: true,
              googlePay: true,
              bankTransfer: false
            },
            fees: input.fees || {
              processingFeePercentage: 2.9,
              fixedFeeAmount: 0.30,
              taxRate: 8.5
            },
            policies: input.policies || {
              refundPolicy: 'flexible',
              refundWindowHours: 24,
              latePaymentFee: 5.00
            },
            notifications: input.notifications || {
              paymentSuccess: true,
              paymentFailed: true,
              refundProcessed: true,
              disputeCreated: true
            },
            security: input.security || {
              requireCVV: true,
              enable3DSecure: true,
              fraudDetection: true
            }
          }
        };
      } catch (error) {
        console.error('Error updating billing configuration:', error);
        return {
          success: false,
          message: `Failed to update billing configuration: ${error.message}`,
          configuration: null
        };
      }
    }
  }
}; 