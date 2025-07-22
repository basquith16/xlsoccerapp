import StripeService from '../../services/stripeService';
import { IUser } from '../../types/models';

export const billingResolvers = {
  Query: {
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
        }));
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        throw new Error('Failed to fetch payment methods');
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
            expMonth: paymentMethod.card.exp_month,
            expYear: paymentMethod.card.exp_year,
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
    }
  }
}; 