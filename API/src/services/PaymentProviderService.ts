import { PaymentProvider, PaymentProviderType, PaymentProviderConfig } from '../interfaces/PaymentProvider';

export class PaymentProviderService {
  private static instance: PaymentProviderService;
  private providers: Map<PaymentProviderType, PaymentProvider> = new Map();
  private config: Map<PaymentProviderType, PaymentProviderConfig> = new Map();

  private constructor() {
    this.initializeDefaultConfig();
  }

  static getInstance(): PaymentProviderService {
    if (!PaymentProviderService.instance) {
      PaymentProviderService.instance = new PaymentProviderService();
    }
    return PaymentProviderService.instance;
  }

  /**
   * Initialize default configuration for payment providers
   */
  private initializeDefaultConfig() {
    // Default Stripe configuration
    this.config.set(PaymentProviderType.STRIPE, {
      type: PaymentProviderType.STRIPE,
      isActive: true,
      isDefault: true,
      config: {
        publicKey: null, // Frontend handles publishable key
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      }
    });

    // Default Square configuration
    this.config.set(PaymentProviderType.SQUARE, {
      type: PaymentProviderType.SQUARE,
      isActive: false,
      isDefault: false,
      config: {
        publicKey: null, // Frontend handles application ID
        webhookSecret: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY,
      }
    });
  }

  /**
   * Dynamically load and get a payment provider
   */
  async getProvider(providerType: PaymentProviderType): Promise<PaymentProvider> {
    // Check if provider is already loaded
    if (this.providers.has(providerType)) {
      return this.providers.get(providerType)!;
    }

    // Check if provider is configured and active
    const config = this.config.get(providerType);
    if (!config || !config.isActive) {
      throw new Error(`Payment provider ${providerType} is not configured or not active`);
    }

    // Dynamically import and instantiate the provider
    let provider: PaymentProvider;

    try {
      switch (providerType) {
        case PaymentProviderType.STRIPE:
          const { StripeProvider } = await import('../providers/StripeProvider');
          provider = new StripeProvider();
          break;

        case PaymentProviderType.SQUARE:
          const { SquareProvider } = await import('../providers/SquareProvider');
          provider = new SquareProvider();
          break;

        default:
          throw new Error(`Unsupported payment provider: ${providerType}`);
      }

      // Cache the provider instance
      this.providers.set(providerType, provider);
      console.log(`✅ Payment provider ${providerType} loaded successfully`);

      return provider;
    } catch (error) {
      console.error(`❌ Failed to load payment provider ${providerType}:`, error);
      throw new Error(`Failed to load payment provider: ${providerType}`);
    }
  }

  /**
   * Get the default payment provider
   */
  async getDefaultProvider(): Promise<PaymentProvider> {
    const defaultConfig = Array.from(this.config.values()).find(config => config.isDefault);
    
    if (!defaultConfig) {
      throw new Error('No default payment provider configured');
    }

    return this.getProvider(defaultConfig.type);
  }

  /**
   * Get active payment provider based on admin configuration
   * For now, this returns the default provider, but can be extended to check database settings
   */
  async getActiveProvider(): Promise<PaymentProvider> {
    // TODO: In the future, this should check the database for admin-configured active provider
    // For now, return the default provider
    return this.getDefaultProvider();
  }

  /**
   * Get all available payment providers (active and inactive)
   */
  getAvailableProviders(): PaymentProviderConfig[] {
    return Array.from(this.config.values());
  }

  /**
   * Get active payment providers
   */
  getActiveProviders(): PaymentProviderConfig[] {
    return Array.from(this.config.values()).filter(config => config.isActive);
  }

  /**
   * Update provider configuration
   */
  updateProviderConfig(providerType: PaymentProviderType, config: Partial<PaymentProviderConfig>) {
    const existingConfig = this.config.get(providerType);
    if (!existingConfig) {
      throw new Error(`Provider ${providerType} not found`);
    }

    const updatedConfig: PaymentProviderConfig = {
      ...existingConfig,
      ...config,
      config: {
        ...existingConfig.config,
        ...config.config,
      }
    };

    this.config.set(providerType, updatedConfig);

    // If provider was made inactive, remove it from cache
    if (!updatedConfig.isActive && this.providers.has(providerType)) {
      this.providers.delete(providerType);
    }

    // If this provider is set as default, make sure no other provider is default
    if (updatedConfig.isDefault) {
      this.config.forEach((cfg, type) => {
        if (type !== providerType && cfg.isDefault) {
          this.config.set(type, { ...cfg, isDefault: false });
        }
      });
    }

    console.log(`🔧 Updated configuration for ${providerType}:`, updatedConfig);
  }

  /**
   * Set the active payment provider
   */
  async setActiveProvider(providerType: PaymentProviderType): Promise<void> {
    const config = this.config.get(providerType);
    if (!config) {
      throw new Error(`Provider ${providerType} not found`);
    }

    // Activate the selected provider and set as default
    this.updateProviderConfig(providerType, {
      isActive: true,
      isDefault: true,
    });

    // Deactivate other providers (for now, only one active at a time)
    this.config.forEach((cfg, type) => {
      if (type !== providerType) {
        this.updateProviderConfig(type, {
          isDefault: false,
        });
      }
    });

    console.log(`🎯 Set ${providerType} as active provider`);
  }

  /**
   * Clear provider cache (useful for configuration changes)
   */
  clearProviderCache(): void {
    this.providers.clear();
    console.log('🧹 Payment provider cache cleared');
  }

  /**
   * Get provider configuration
   */
  getProviderConfig(providerType: PaymentProviderType): PaymentProviderConfig | undefined {
    return this.config.get(providerType);
  }

  /**
   * Check if a provider is available and properly configured
   */
  async isProviderAvailable(providerType: PaymentProviderType): Promise<boolean> {
    try {
      const config = this.config.get(providerType);
      if (!config || !config.isActive) {
        return false;
      }

      // Try to load the provider to check if it's properly configured
      await this.getProvider(providerType);
      return true;
    } catch (error) {
      console.error(`Provider ${providerType} is not available:`, error);
      return false;
    }
  }

  /**
   * Get provider performance metrics (for future implementation)
   */
  getProviderMetrics(providerType: PaymentProviderType) {
    // TODO: Implement metrics collection
    return {
      provider: providerType,
      isLoaded: this.providers.has(providerType),
      isActive: this.config.get(providerType)?.isActive || false,
      loadTime: 0, // To be implemented
      successRate: 0, // To be implemented
    };
  }
}

// Export singleton instance
export const paymentProviderService = PaymentProviderService.getInstance();
export default paymentProviderService;