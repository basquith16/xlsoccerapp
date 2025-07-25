import { useQuery } from '@apollo/client';
import { 
  GET_CUSTOMER_ANALYTICS,
  GET_SESSION_ANALYTICS,
  GET_OPERATIONAL_ANALYTICS,
  GET_BUSINESS_INTELLIGENCE,
  GET_COMBINED_ANALYTICS
} from '../../graphql/queries/analytics';

export const useCustomerAnalytics = (timeRange: string = '30d') => {
  return useQuery(GET_CUSTOMER_ANALYTICS, {
    variables: { timeRange },
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });
};

export const useSessionAnalytics = (timeRange: string = '30d') => {
  return useQuery(GET_SESSION_ANALYTICS, {
    variables: { timeRange },
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });
};

export const useOperationalAnalytics = (timeRange: string = '30d') => {
  return useQuery(GET_OPERATIONAL_ANALYTICS, {
    variables: { timeRange },
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });
};

export const useBusinessIntelligence = (timeRange: string = '30d') => {
  return useQuery(GET_BUSINESS_INTELLIGENCE, {
    variables: { timeRange },
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });
};

export const useCombinedAnalytics = (timeRange: string = '30d') => {
  return useQuery(GET_COMBINED_ANALYTICS, {
    variables: { timeRange },
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });
};