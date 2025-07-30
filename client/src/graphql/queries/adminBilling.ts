import { gql } from '@apollo/client';

export const GET_BILLING_ANALYTICS = gql`
  query GetBillingAnalytics($timeRange: String!) {
    billingAnalytics(timeRange: $timeRange) {
      totalRevenue
      totalTransactions
      activeCustomers
      averageOrderValue
      revenueChange
      transactionChange
      customerChange
      averageOrderChange
      periodComparison
      
      revenueByMonth {
        month
        revenue
        transactions
      }
      
      paymentMethodBreakdown {
        method
        percentage
        amount
      }
      
      topSessions {
        name
        revenue
        bookings
      }
    }
  }
`;

export const GET_ADMIN_TRANSACTIONS = gql`
  query GetAdminTransactions(
    $limit: Int
    $offset: Int
    $search: String
    $status: String
    $startDate: String
    $endDate: String
  ) {
    adminTransactions(
      limit: $limit
      offset: $offset
      search: $search
      status: $status
      startDate: $startDate
      endDate: $endDate
    ) {
      nodes {
        id
        amount
        currency
        status
        description
        createdAt
        fees
        netAmount
        refunded
        disputed
        
        customer {
          id
          name
          email
        }
        
        paymentMethod {
          id
          type
          card {
            brand
            last4
          }
        }
        
        session {
          id
          name
        }
        
        stripePaymentIntentId
      }
      totalCount
      hasNextPage
    }
  }
`;

export const GET_ADMIN_CUSTOMERS = gql`
  query GetAdminCustomers(
    $limit: Int
    $offset: Int
    $search: String
    $status: String
    $riskLevel: String
  ) {
    adminCustomers(
      limit: $limit
      offset: $offset
      search: $search
      status: $status
      riskLevel: $riskLevel
    ) {
      nodes {
        id
        email
        name
        phone
        createdAt
        
        billing {
          totalSpent
          lastPaymentDate
          subscriptionCount
          paymentMethodCount
          defaultPaymentMethodId
          status
          riskLevel
        }
        
        paymentMethods {
          id
          type
          card {
            brand
            last4
            exp_month
            exp_year
          }
          isDefault
        }
      }
      totalCount
      hasNextPage
    }
  }
`;

export const GET_ADMIN_SUBSCRIPTIONS = gql`
  query GetAdminSubscriptions(
    $limit: Int
    $offset: Int
    $status: String
    $interval: String
  ) {
    adminSubscriptions(
      limit: $limit
      offset: $offset
      status: $status
      interval: $interval
    ) {
      nodes {
        id
        status
        currentPeriodStart
        currentPeriodEnd
        cancelAtPeriodEnd
        createdAt
        
        customer {
          id
          name
          email
        }
        
        plan {
          id
          name
          amount
          currency
          interval
        }
      }
      totalCount
      hasNextPage
      
      metrics {
        totalMRR
        totalARR
        activeCount
        pausedCount
        cancelledCount
      }
    }
  }
`;

export const GET_REFUNDS_DISPUTES = gql`
  query GetRefundsDisputes(
    $limit: Int
    $offset: Int
    $type: String
    $status: String
  ) {
    refundsDisputes(
      limit: $limit
      offset: $offset
      type: $type
      status: $status
    ) {
      nodes {
        id
        type
        amount
        currency
        reason
        status
        createdAt
        updatedAt
        description
        
        transaction {
          id
          amount
          createdAt
        }
        
        customer {
          id
          name
          email
        }
      }
      totalCount
      hasNextPage
      
      summary {
        totalRefunds
        totalDisputes
        pendingCount
        totalAmount
      }
    }
  }
`;

export const GENERATE_FINANCIAL_REPORT = gql`
  mutation GenerateFinancialReport($input: GenerateReportInput!) {
    generateFinancialReport(input: $input) {
      reportId
      status
      downloadUrl
      expiresAt
    }
  }
`;

export const GET_BILLING_CONFIGURATION = gql`
  query GetBillingConfiguration {
    billingConfiguration {
      activeProvider
      
      providers {
        type
        name
        displayName
        isActive
        isDefault
        isConnected
        config {
          publicKey
          environment
        }
      }
      
      stripe {
        isConnected
        accountId
        defaultCurrency
      }
      
      square {
        isConnected
        accountId
        environment
      }
      
      paymentMethods {
        cards
        applePay
        googlePay
        bankTransfer
      }
      
      fees {
        processingFeePercentage
        fixedFeeAmount
        taxRate
      }
      
      policies {
        refundPolicy
        refundWindowHours
        latePaymentFee
      }
      
      notifications {
        paymentSuccess
        paymentFailed
        refundProcessed
        disputeCreated
      }
      
      security {
        requireCVV
        enable3DSecure
        fraudDetection
      }
    }
  }
`;

export const GET_PAYMENT_PROVIDERS = gql`
  query GetPaymentProviders {
    paymentProviders {
      type
      name
      displayName
      isActive
      isDefault
      isConnected
      config {
        publicKey
        environment
      }
      metrics {
        loadTime
        successRate
        isLoaded
      }
    }
  }
`;

export const UPDATE_BILLING_CONFIGURATION = gql`
  mutation UpdateBillingConfiguration($input: UpdateBillingConfigInput!) {
    updateBillingConfiguration(input: $input) {
      success
      message
      configuration {
        activeProvider
        
        providers {
          type
          name
          displayName
          isActive
          isDefault
          isConnected
        }
        
        stripe {
          isConnected
          accountId
          defaultCurrency
        }
        
        square {
          isConnected
          accountId
          environment
        }
        
        paymentMethods {
          cards
          applePay
          googlePay
          bankTransfer
        }
        
        fees {
          processingFeePercentage
          fixedFeeAmount
          taxRate
        }
        
        policies {
          refundPolicy
          refundWindowHours
          latePaymentFee
        }
        
        notifications {
          paymentSuccess
          paymentFailed
          refundProcessed
          disputeCreated
        }
        
        security {
          requireCVV
          enable3DSecure
          fraudDetection
        }
      }
    }
  }
`;

export const SET_ACTIVE_PAYMENT_PROVIDER = gql`
  mutation SetActivePaymentProvider($providerType: String!) {
    setActivePaymentProvider(providerType: $providerType) {
      success
      message
      activeProvider
    }
  }
`;

export const UPDATE_PAYMENT_PROVIDER_CONFIG = gql`
  mutation UpdatePaymentProviderConfig($input: UpdateProviderConfigInput!) {
    updatePaymentProviderConfig(input: $input) {
      success
      message
      provider {
        type
        name
        displayName
        isActive
        isDefault
        isConnected
        config {
          publicKey
          environment
        }
      }
    }
  }
`;

export const TEST_PAYMENT_PROVIDER_CONNECTION = gql`
  mutation TestPaymentProviderConnection($providerType: String!) {
    testPaymentProviderConnection(providerType: $providerType) {
      success
      message
      connectionStatus
      responseTime
    }
  }
`;

export const GET_PAYMENT_PROVIDER_METRICS = gql`
  query GetPaymentProviderMetrics($providerType: String!) {
    paymentProviderMetrics(providerType: $providerType) {
      provider
      isLoaded
      isActive
      loadTime
      successRate
      totalTransactions
      totalVolume
      averageTransactionValue
      lastConnectionTest
    }
  }
`;