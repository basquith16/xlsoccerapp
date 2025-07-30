import { gql } from 'graphql-tag';

export const paymentProviderSchema = gql`
  # Payment Provider Types
  enum PaymentProviderType {
    STRIPE
    SQUARE
  }

  # Payment Provider Configuration
  type PaymentProviderConfig {
    hasPublicKey: Boolean!
    hasWebhookSecret: Boolean!
  }

  # Payment Provider Metrics
  type PaymentProviderMetrics {
    isLoaded: Boolean!
    loadTime: Float!
    successRate: Float!
  }

  # Payment Provider
  type PaymentProvider {
    type: PaymentProviderType!
    displayName: String!
    isActive: Boolean!
    isDefault: Boolean!
    isAvailable: Boolean!
    config: PaymentProviderConfig!
    metrics: PaymentProviderMetrics!
  }

  # Payment Provider Test Result
  type PaymentProviderTestResult {
    success: Boolean!
    message: String!
    details: String!
  }

  # Payment Provider Operation Result
  type PaymentProviderOperationResult {
    success: Boolean!
    message: String!
    provider: PaymentProvider
  }

  # Input Types
  input SetActivePaymentProviderInput {
    type: PaymentProviderType!
  }

  input UpdatePaymentProviderConfigInput {
    type: PaymentProviderType!
    isActive: Boolean
    config: JSON
  }

  input TogglePaymentProviderInput {
    type: PaymentProviderType!
    isActive: Boolean!
  }

  # Note: Query and Mutation extensions are now in billing.ts to avoid conflicts
`;