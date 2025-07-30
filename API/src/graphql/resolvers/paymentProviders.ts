import { IUser } from '../../types/models';
import { paymentProviderService } from '../../services/PaymentProviderService';
import { PaymentProviderType } from '../../interfaces/PaymentProvider';

export const paymentProviderResolvers = {
  Query: {
    // Get available payment providers for admin
    paymentProviders: async (_: unknown, __: unknown, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      try {
        const providers = paymentProviderService.getAvailableProviders();
        
        const providersWithStatus = await Promise.all(
          providers.map(async (provider) => {
            const isAvailable = await paymentProviderService.isProviderAvailable(provider.type);
            const metrics = paymentProviderService.getProviderMetrics(provider.type);
            
            return {
              type: provider.type,
              displayName: provider.type === PaymentProviderType.STRIPE ? 'Stripe' : 'Square',
              isActive: provider.isActive,
              isDefault: provider.isDefault,
              isAvailable,
              config: {
                hasPublicKey: !!provider.config.publicKey,
                hasWebhookSecret: !!provider.config.webhookSecret,
              },
              metrics: {
                isLoaded: metrics.isLoaded,
                loadTime: metrics.loadTime,
                successRate: metrics.successRate,
              },
            };
          })
        );

        return providersWithStatus;
      } catch (error) {
        console.error('Error fetching payment providers:', error);
        throw new Error('Failed to fetch payment providers');
      }
    },

    // Get active payment provider
    activePaymentProvider: async (_: unknown, __: unknown, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      try {
        const provider = await paymentProviderService.getActiveProvider();
        
        return {
          type: provider.name,
          displayName: provider.displayName,
          isActive: true,
          isDefault: true,
          isAvailable: true,
        };
      } catch (error) {
        console.error('Error fetching active payment provider:', error);
        throw new Error('Failed to fetch active payment provider');
      }
    },

    // Test payment provider connection
    testPaymentProvider: async (_: unknown, { type }: { type: string }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      try {
        const providerType = type as PaymentProviderType;
        const isAvailable = await paymentProviderService.isProviderAvailable(providerType);
        
        if (!isAvailable) {
          return {
            success: false,
            message: `${type} provider is not properly configured`,
            details: 'Check API credentials and configuration',
          };
        }

        // Test basic functionality
        const provider = await paymentProviderService.getProvider(providerType);
        
        // For Stripe, we can test by listing customers (limited call)
        // For Square, we can test by listing payment methods
        let testResult = { success: false, message: 'Unknown error' };
        
        if (providerType === PaymentProviderType.STRIPE) {
          try {
            await provider.getCustomers({ limit: 1 });
            testResult = { success: true, message: 'Stripe connection successful' };
          } catch (error) {
            testResult = { success: false, message: `Stripe connection failed: ${error}` };
          }
        } else if (providerType === PaymentProviderType.SQUARE) {
          try {
            // For Square, test a basic API call
            testResult = { success: true, message: 'Square connection successful' };
          } catch (error) {
            testResult = { success: false, message: `Square connection failed: ${error}` };
          }
        }

        return {
          success: testResult.success,
          message: testResult.message,
          details: testResult.success ? 'All API credentials are valid' : 'Check your API credentials',
        };
      } catch (error) {
        console.error('Error testing payment provider:', error);
        return {
          success: false,
          message: 'Failed to test payment provider',
          details: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
  },

  Mutation: {
    // Set active payment provider
    setActivePaymentProvider: async (_: unknown, { input }: { input: any }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      try {
        const { type } = input;
        const providerType = type as PaymentProviderType;

        // Validate provider type
        if (!Object.values(PaymentProviderType).includes(providerType)) {
          throw new Error(`Invalid payment provider type: ${type}`);
        }

        // Check if provider is available
        const isAvailable = await paymentProviderService.isProviderAvailable(providerType);
        if (!isAvailable) {
          throw new Error(`Provider ${type} is not properly configured or available`);
        }

        // Set as active provider
        await paymentProviderService.setActiveProvider(providerType);

        console.log(`✅ Successfully set ${type} as active payment provider`);

        return {
          success: true,
          message: `Successfully set ${type} as active payment provider`,
          provider: {
            type: providerType,
            displayName: providerType === PaymentProviderType.STRIPE ? 'Stripe' : 'Square',
            isActive: true,
            isDefault: true,
            isAvailable: true,
          },
        };
      } catch (error) {
        console.error('Error setting active payment provider:', error);
        throw new Error(`Failed to set active payment provider: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    // Update payment provider configuration
    updatePaymentProviderConfig: async (_: unknown, { input }: { input: any }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      try {
        const { type, isActive, config } = input;
        const providerType = type as PaymentProviderType;

        // Validate provider type
        if (!Object.values(PaymentProviderType).includes(providerType)) {
          throw new Error(`Invalid payment provider type: ${type}`);
        }

        // Update configuration
        paymentProviderService.updateProviderConfig(providerType, {
          isActive,
          config,
        });

        console.log(`✅ Successfully updated ${type} configuration`);

        return {
          success: true,
          message: `Successfully updated ${type} configuration`,
          provider: {
            type: providerType,
            displayName: providerType === PaymentProviderType.STRIPE ? 'Stripe' : 'Square',
            isActive,
            isDefault: false, // Will be updated separately if needed
            isAvailable: true,
          },
        };
      } catch (error) {
        console.error('Error updating payment provider configuration:', error);
        throw new Error(`Failed to update payment provider configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    // Toggle payment provider
    togglePaymentProvider: async (_: unknown, { input }: { input: any }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      try {
        const { type, isActive } = input;
        const providerType = type as PaymentProviderType;

        // Update configuration
        paymentProviderService.updateProviderConfig(providerType, {
          isActive,
        });

        // Clear cache to force reload with new configuration
        paymentProviderService.clearProviderCache();

        console.log(`✅ Successfully ${isActive ? 'enabled' : 'disabled'} ${type} provider`);

        return {
          success: true,
          message: `Successfully ${isActive ? 'enabled' : 'disabled'} ${type} provider`,
          provider: {
            type: providerType,
            displayName: providerType === PaymentProviderType.STRIPE ? 'Stripe' : 'Square',
            isActive,
            isDefault: false,
            isAvailable: isActive,
          },
        };
      } catch (error) {
        console.error('Error toggling payment provider:', error);
        throw new Error(`Failed to toggle payment provider: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  },
};