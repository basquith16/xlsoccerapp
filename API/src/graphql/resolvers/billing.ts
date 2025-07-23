import StripeService from '../../services/stripeService';
import { IUser } from '../../types/models';

export const billingResolvers = {
  Query: {
    // Admin billing analytics
    billingAnalytics: async (_: unknown, { timeRange }: { timeRange: string }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      try {
        // Get all payment intents for the specified time range
        const payments = await StripeService.getPaymentIntents({ 
          created: { gte: Math.floor(Date.now() / 1000) - (timeRange === '30d' ? 30 * 24 * 3600 : 7 * 24 * 3600) } 
        });

        const successfulPayments = payments.data.filter(p => p.status === 'succeeded');
        const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0) / 100;
        const totalTransactions = successfulPayments.length;
        const activeCustomers = new Set(successfulPayments.map(p => p.customer)).size;
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
          const customer = payment.customer ? await StripeService.getCustomer(payment.customer) : null;
          
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
            customer: customer ? {
              id: customer.id,
              name: customer.name || customer.email,
              email: customer.email
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
              paymentMethodCount: paymentMethods?.data?.length || 0,
              defaultPaymentMethodId: customer.invoice_settings?.default_payment_method,
              status: 'active',
              riskLevel: 'low'
            },
            paymentMethods: paymentMethods?.data?.map((pm: any) => ({
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
    }
  }
}; 