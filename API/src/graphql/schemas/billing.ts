import { gql } from 'graphql-tag';

export const billingSchema = gql`
  type PaymentIntent {
    id: String!
    clientSecret: String!
    amount: Int!
    currency: String!
    status: String!
  }

  type Transaction {
    id: String!
    amount: Int!
    currency: String!
    status: String!
    description: String!
    createdAt: String!
    paymentMethod: PaymentMethod
  }

  type PaymentMethod {
    id: String!
    type: String!
    card: CardDetails
    billingDetails: BillingDetails
  }

  type CardDetails {
    id: ID
    brand: String
    last4: String
    exp_month: Int
    exp_year: Int
    fingerprint: String
  }

  type BillingDetails {
    id: ID
    name: String
    email: String
    address: Address
  }

  type Address {
    line1: String
    line2: String
    city: String
    state: String
    postalCode: String
    country: String
  }

  type Customer {
    id: String!
    email: String!
    name: String
    paymentMethods: [PaymentMethod!]!
    defaultPaymentMethod: PaymentMethod
  }

  type SetupIntent {
    id: String!
    clientSecret: String!
    status: String!
  }

  input CreatePaymentIntentInput {
    sessionId: ID!
    price: Float!
  }

  input VerifyPaymentIntentInput {
    paymentIntentId: String!
  }

  type PaymentIntentVerification {
    id: String!
    status: String!
    customer: String
    amount: Int!
    paymentMethod: String
    setupFutureUsage: String
  }

  input CreateSetupIntentInput {
    returnUrl: String
  }

  input AttachPaymentMethodInput {
    paymentMethodId: String!
  }

  input DetachPaymentMethodInput {
    paymentMethodId: String!
  }

  input SetDefaultPaymentMethodInput {
    paymentMethodId: String!
  }

  # Admin Billing Types
  type BillingAnalytics {
    totalRevenue: Float!
    totalTransactions: Int!
    activeCustomers: Int!
    averageOrderValue: Float!
    revenueChange: Float!
    transactionChange: Float!
    customerChange: Float!
    averageOrderChange: Float!
    periodComparison: String!
    
    revenueByMonth: [MonthlyRevenue!]!
    paymentMethodBreakdown: [PaymentMethodStats!]!
    topSessions: [SessionRevenue!]!
  }

  type MonthlyRevenue {
    month: String!
    revenue: Float!
    transactions: Int!
  }

  type PaymentMethodStats {
    method: String!
    percentage: Float!
    amount: Float!
  }

  type SessionRevenue {
    name: String!
    revenue: Float!
    bookings: Int!
  }

  type AdminTransaction {
    id: String!
    amount: Float!
    currency: String!
    status: String!
    description: String!
    createdAt: String!
    fees: Float!
    netAmount: Float!
    refunded: Boolean!
    disputed: Boolean!
    
    customer: AdminCustomerSummary
    paymentMethod: PaymentMethodSummary
    session: SessionSummary
    stripePaymentIntentId: String!
  }

  type AdminCustomerSummary {
    id: String!
    name: String!
    email: String!
  }

  type PaymentMethodSummary {
    id: String!
    type: String!
    card: CardSummary
  }

  type CardSummary {
    brand: String!
    last4: String!
  }

  type AdminTransactionConnection {
    nodes: [AdminTransaction!]!
    totalCount: Int!
    hasNextPage: Boolean!
  }

  type AdminCustomer {
    id: String!
    email: String!
    name: String!
    phone: String
    createdAt: String!
    
    billing: CustomerBilling!
    paymentMethods: [CustomerPaymentMethod!]!
  }

  type CustomerBilling {
    totalSpent: Float!
    lastPaymentDate: String
    subscriptionCount: Int!
    paymentMethodCount: Int!
    defaultPaymentMethodId: String
    status: String!
    riskLevel: String!
  }

  type CustomerPaymentMethod {
    id: String!
    type: String!
    card: CardDetails
    isDefault: Boolean!
  }

  type AdminCustomerConnection {
    nodes: [AdminCustomer!]!
    totalCount: Int!
    hasNextPage: Boolean!
  }

  type AdminSubscription {
    id: String!
    status: String!
    currentPeriodStart: String!
    currentPeriodEnd: String!
    cancelAtPeriodEnd: Boolean!
    createdAt: String!
    
    customer: AdminCustomerSummary!
    plan: SubscriptionPlan!
  }

  type SubscriptionPlan {
    id: String!
    name: String!
    amount: Float!
    currency: String!
    interval: String!
  }

  type AdminSubscriptionConnection {
    nodes: [AdminSubscription!]!
    totalCount: Int!
    hasNextPage: Boolean!
    metrics: SubscriptionMetrics!
  }

  type SubscriptionMetrics {
    totalMRR: Float!
    totalARR: Float!
    activeCount: Int!
    pausedCount: Int!
    cancelledCount: Int!
  }

  type RefundDispute {
    id: String!
    type: String!
    amount: Float!
    currency: String!
    reason: String!
    status: String!
    createdAt: String!
    updatedAt: String!
    description: String!
    
    transaction: AdminTransaction!
    customer: AdminCustomerSummary!
  }

  type RefundDisputeConnection {
    nodes: [RefundDispute!]!
    totalCount: Int!
    hasNextPage: Boolean!
    summary: RefundDisputeSummary!
  }

  type RefundDisputeSummary {
    totalRefunds: Int!
    totalDisputes: Int!
    pendingCount: Int!
    totalAmount: Float!
  }

  # Payment Provider Management Types
  type PaymentProviderInfo {
    type: String!
    name: String!
    displayName: String!
    isActive: Boolean!
    isDefault: Boolean!
    isConnected: Boolean!
    config: PaymentProviderConfigInfo
  }

  type PaymentProviderConfigInfo {
    publicKey: String
    environment: String
  }

  type PaymentProviderMetricsInfo {
    provider: String!
    isLoaded: Boolean!
    isActive: Boolean!
    loadTime: Float!
    successRate: Float!
    totalTransactions: Int!
    totalVolume: Float!
    averageTransactionValue: Float!
    lastConnectionTest: String!
  }

  type PaymentProviderTestResult {
    success: Boolean!
    message: String!
    connectionStatus: String!
    responseTime: Float!
  }

  type PaymentProviderSwitchResult {
    success: Boolean!
    message: String!
    activeProvider: String
  }

  type PaymentProviderUpdateResult {
    success: Boolean!
    message: String!
    provider: PaymentProviderInfo
  }

  input UpdateProviderConfigInput {
    providerType: String!
    config: JSON
    isActive: Boolean
    isDefault: Boolean
  }

  type BillingConfiguration {
    activeProvider: String!
    providers: [PaymentProviderInfo!]!
    stripe: StripeConfig!
    square: SquareConfig!
    paymentMethods: PaymentMethodConfig!
    fees: FeeConfig!
    policies: PolicyConfig!
    notifications: NotificationConfig!
    security: SecurityConfig!
  }

  type StripeConfig {
    isConnected: Boolean!
    accountId: String
    defaultCurrency: String!
  }

  type SquareConfig {
    isConnected: Boolean!
    accountId: String
    environment: String!
  }

  type PaymentMethodConfig {
    cards: Boolean!
    applePay: Boolean!
    googlePay: Boolean!
    bankTransfer: Boolean!
  }

  type FeeConfig {
    processingFeePercentage: Float!
    fixedFeeAmount: Float!
    taxRate: Float!
  }

  type PolicyConfig {
    refundPolicy: String!
    refundWindowHours: Int!
    latePaymentFee: Float!
  }

  type NotificationConfig {
    paymentSuccess: Boolean!
    paymentFailed: Boolean!
    refundProcessed: Boolean!
    disputeCreated: Boolean!
  }

  type SecurityConfig {
    requireCVV: Boolean!
    enable3DSecure: Boolean!
    fraudDetection: Boolean!
  }

  type ReportGeneration {
    reportId: String!
    status: String!
    downloadUrl: String
    expiresAt: String
  }

  input GenerateReportInput {
    reportType: String!
    startDate: String!
    endDate: String!
    format: String!
  }

  input UpdateBillingConfigInput {
    activeProvider: String
    paymentMethods: PaymentMethodConfigInput
    fees: FeeConfigInput
    policies: PolicyConfigInput
    notifications: NotificationConfigInput
    security: SecurityConfigInput
  }

  input PaymentMethodConfigInput {
    cards: Boolean
    applePay: Boolean
    googlePay: Boolean
    bankTransfer: Boolean
  }

  input FeeConfigInput {
    processingFeePercentage: Float
    fixedFeeAmount: Float
    taxRate: Float
  }

  input PolicyConfigInput {
    refundPolicy: String
    refundWindowHours: Int
    latePaymentFee: Float
  }

  input NotificationConfigInput {
    paymentSuccess: Boolean
    paymentFailed: Boolean
    refundProcessed: Boolean
    disputeCreated: Boolean
  }

  input SecurityConfigInput {
    requireCVV: Boolean
    enable3DSecure: Boolean
    fraudDetection: Boolean
  }

  type BillingConfigUpdateResult {
    success: Boolean!
    message: String!
    configuration: BillingConfiguration
  }

  # Extend existing Query type with payment provider management
  extend type Query {
    # Get billing configuration including payment providers
    billingConfiguration: BillingConfiguration
    
    # Get all payment providers (admin only)
    paymentProviders: [PaymentProviderInfo!]!
    
    # Get payment provider metrics (admin only)
    paymentProviderMetrics(providerType: String!): PaymentProviderMetricsInfo!
  }

  # Extend existing Mutation type with payment provider management
  extend type Mutation {
    # Set active payment provider (admin only)
    setActivePaymentProvider(providerType: String!): PaymentProviderSwitchResult!
    
    # Update payment provider configuration (admin only)
    updatePaymentProviderConfig(input: UpdateProviderConfigInput!): PaymentProviderUpdateResult!
    
    # Test payment provider connection (admin only)
    testPaymentProviderConnection(providerType: String!): PaymentProviderTestResult!
    
    # Update billing configuration (admin only)
    updateBillingConfiguration(input: UpdateBillingConfigInput!): BillingConfigUpdateResult!
  }
`; 