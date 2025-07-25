import { gql } from '@apollo/client';

export const GET_CUSTOMER_ANALYTICS = gql`
  query GetCustomerAnalytics($timeRange: String!) {
    customerAnalytics(timeRange: $timeRange) {
      totalCustomers
      newCustomers
      activeCustomers
      churnRate
      customerChange
      newCustomerChange
      activeCustomerChange
      churnRateChange
      
      customerGrowth {
        date
        total
        new
        active
        churned
      }
      
      customerSegmentation {
        segment
        count
        percentage
        averageSpend
      }
      
      cohortAnalysis {
        cohort
        month0
        month1
        month2
        month3
        month6
        month12
      }
      
      customerLifetimeValue {
        average
        median
        top10Percent
        segments {
          segment
          clv
        }
      }
    }
  }
`;

export const GET_SESSION_ANALYTICS = gql`
  query GetSessionAnalytics($timeRange: String!) {
    sessionAnalytics(timeRange: $timeRange) {
      totalSessions
      totalBookings
      averageCapacity
      utilizationRate
      sessionChange
      bookingChange
      capacityChange
      utilizationChange
      
      sessionPerformance {
        sessionId
        name
        sport
        bookings
        capacity
        utilizationRate
        revenue
        averageRating
      }
      
      timeSlotAnalysis {
        timeSlot
        bookings
        utilization
        revenue
        popularity
      }
      
      coachPerformance {
        coachId
        name
        sessionsLed
        totalBookings
        averageUtilization
        revenue
        rating
      }
      
      sportPopularity {
        sport
        sessions
        bookings
        revenue
        growth
      }
      
      seasonalTrends {
        month
        sessions
        bookings
        revenue
        utilization
      }
    }
  }
`;

export const GET_OPERATIONAL_ANALYTICS = gql`
  query GetOperationalAnalytics($timeRange: String!) {
    operationalAnalytics(timeRange: $timeRange) {
      facilityUtilization
      averageSessionDuration
      peakHours
      equipmentUsage
      staffEfficiency
      
      facilityMetrics {
        date
        utilization
        sessions
        revenue
        maintenanceEvents
      }
      
      staffMetrics {
        staffId
        name
        role
        hoursWorked
        sessionsManaged
        efficiency
        performance
      }
      
      equipmentMetrics {
        equipmentType
        utilizationRate
        maintenanceFrequency
        cost
        availability
      }
      
      peakAnalysis {
        hour
        utilization
        bookings
        revenue
        demandLevel
      }
      
      capacityPlanning {
        projectedDemand
        recommendedCapacity
        expansionSuggestions
        resourceNeeds
      }
    }
  }
`;

export const GET_BUSINESS_INTELLIGENCE = gql`
  query GetBusinessIntelligence($timeRange: String!) {
    businessIntelligence(timeRange: $timeRange) {
      keyMetrics {
        customerAcquisitionCost
        customerLifetimeValue
        monthlyRecurringRevenue
        churnRate
        netPromoterScore
      }
      
      forecasting {
        revenueProjection {
          month
          projected
          confidence
          factors
        }
        
        customerProjection {
          month
          projected
          acquisitions
          churn
        }
        
        demandForecasting {
          sport
          timeSlot
          projectedDemand
          seasonality
        }
      }
      
      marketingInsights {
        channelPerformance {
          channel
          acquisitions
          cost
          conversion
          roi
        }
        
        campaignEffectiveness {
          campaign
          impressions
          clicks
          conversions
          revenue
        }
      }
      
      competitiveAnalysis {
        marketPosition
        pricingComparison
        serviceComparison
        opportunityAreas
      }
      
      recommendations {
        priority
        category
        title
        description
        expectedImpact
        effort
      }
    }
  }
`;

export const GET_COMBINED_ANALYTICS = gql`
  query GetCombinedAnalytics($timeRange: String!) {
    billingAnalytics(timeRange: $timeRange) {
      totalRevenue
      totalTransactions
      activeCustomers
      averageOrderValue
      revenueChange
      transactionChange
      customerChange
      averageOrderChange
      
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
    
    customerAnalytics(timeRange: $timeRange) {
      totalCustomers
      newCustomers
      activeCustomers
      churnRate
      
      customerGrowth {
        date
        total
        new
        active
      }
      
      customerSegmentation {
        segment
        count
        percentage
        averageSpend
      }
    }
    
    sessionAnalytics(timeRange: $timeRange) {
      totalSessions
      totalBookings
      averageCapacity
      utilizationRate
      
      sessionPerformance {
        sessionId
        name
        sport
        bookings
        capacity
        utilizationRate
        revenue
      }
      
      timeSlotAnalysis {
        timeSlot
        bookings
        utilization
        revenue
      }
      
      coachPerformance {
        coachId
        name
        sessionsLed
        totalBookings
        revenue
      }
    }
  }
`;