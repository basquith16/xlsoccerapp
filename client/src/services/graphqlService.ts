import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { 
  GET_ME, 
  GET_SESSIONS, 
  GET_ADMIN_SESSIONS,
  GET_SESSION, 
  GET_SESSION_BY_SLUG,
  GET_PLAYERS, 
  GET_PLAYER, 
  GET_MY_BOOKINGS, 
  GET_REVIEWS,
  GET_FAMILY_MEMBERS,
  GET_CUSTOMER,
  GET_TRANSACTIONS,
  GET_PAYMENT_METHODS
} from '../graphql/queries';
import { 
  SIGNUP, 
  LOGIN, 
  FORGOT_PASSWORD, 
  RESET_PASSWORD, 
  UPDATE_PASSWORD, 
  UPDATE_ME,
  CREATE_BOOKING, 
  CREATE_REVIEW,
  ADD_FAMILY_MEMBER,
  REMOVE_FAMILY_MEMBER,
  CREATE_SETUP_INTENT,
  ATTACH_PAYMENT_METHOD,
  DETACH_PAYMENT_METHOD,
  SET_DEFAULT_PAYMENT_METHOD
} from '../graphql/mutations';

// Authentication Hooks
export const useSignup = () => {
  return useMutation(SIGNUP);
};

export const useLogin = () => {
  return useMutation(LOGIN);
};

export const useForgotPassword = () => {
  return useMutation(FORGOT_PASSWORD);
};

export const useResetPassword = () => {
  return useMutation(RESET_PASSWORD);
};

export const useUpdatePassword = () => {
  return useMutation(UPDATE_PASSWORD);
};

export const useUpdateMe = () => {
  return useMutation(UPDATE_ME);
};

// User Hooks
export const useMe = () => {
  const token = localStorage.getItem('token');
  return useQuery(GET_ME, {
    errorPolicy: 'all',
    skip: !token, // Skip the query if no token exists
  });
};

// Session Hooks
export const useSessions = (limit?: number, offset?: number) => {
  return useQuery(GET_SESSIONS, {
    variables: { limit, offset },
    errorPolicy: 'all',
  });
};

export const useAdminSessions = (limit?: number, offset?: number) => {
  return useQuery(GET_ADMIN_SESSIONS, {
    variables: { limit, offset },
    errorPolicy: 'all',
  });
};

export const useSession = (id: string) => {
  return useQuery(GET_SESSION, {
    variables: { id },
    errorPolicy: 'all',
  });
};

export const useSessionBySlug = (slug: string) => {
  return useQuery(GET_SESSION_BY_SLUG, {
    variables: { slug },
    errorPolicy: 'all',
  });
};

export const useLazySession = () => {
  return useLazyQuery(GET_SESSION, {
    errorPolicy: 'all',
  });
};

// Player Hooks
export const usePlayers = () => {
  return useQuery(GET_PLAYERS, {
    errorPolicy: 'all',
  });
};

export const usePlayer = (id: string) => {
  return useQuery(GET_PLAYER, {
    variables: { id },
    errorPolicy: 'all',
  });
};

// Booking Hooks
export const useMyBookings = () => {
  const token = localStorage.getItem('token');
  return useQuery(GET_MY_BOOKINGS, {
    errorPolicy: 'all',
    skip: !token, // Skip the query if no token exists
  });
};

export const useFamilyMembers = () => {
  const token = localStorage.getItem('token');
  return useQuery(GET_FAMILY_MEMBERS, {
    errorPolicy: 'all',
    skip: !token, // Skip the query if no token exists
  });
};

export const useCreateBooking = () => {
  return useMutation(CREATE_BOOKING);
};

// Review Hooks
export const useReviews = () => {
  return useQuery(GET_REVIEWS, {
    errorPolicy: 'all',
  });
};

export const useCreateReview = () => {
  return useMutation(CREATE_REVIEW);
};

// Family Hooks
export const useAddFamilyMember = () => {
  return useMutation(ADD_FAMILY_MEMBER);
};

export const useRemoveFamilyMember = () => {
  return useMutation(REMOVE_FAMILY_MEMBER);
};

// Billing Hooks
export const useCustomer = () => {
  const token = localStorage.getItem('token');
  return useQuery(GET_CUSTOMER, {
    errorPolicy: 'all',
    skip: !token,
  });
};

export const useTransactions = () => {
  const token = localStorage.getItem('token');
  return useQuery(GET_TRANSACTIONS, {
    errorPolicy: 'all',
    skip: !token,
  });
};

export const usePaymentMethods = () => {
  const token = localStorage.getItem('token');
  return useQuery(GET_PAYMENT_METHODS, {
    errorPolicy: 'all',
    skip: !token,
  });
};

export const useCreateSetupIntent = () => {
  return useMutation(CREATE_SETUP_INTENT);
};

export const useAttachPaymentMethod = () => {
  return useMutation(ATTACH_PAYMENT_METHOD);
};

export const useDetachPaymentMethod = () => {
  return useMutation(DETACH_PAYMENT_METHOD);
};

export const useSetDefaultPaymentMethod = () => {
  return useMutation(SET_DEFAULT_PAYMENT_METHOD);
};

// Utility functions for handling GraphQL responses
export const handleGraphQLError = (error: any) => {
  if (error?.graphQLErrors) {
    return error.graphQLErrors[0]?.message || 'An error occurred';
  }
  if (error?.networkError) {
    return 'Network error. Please check your connection.';
  }
  return error?.message || 'An unexpected error occurred';
};

export const handleMutationResponse = (data: any) => {
  if (data?.status === 'success') {
    return { success: true, data: data.data, message: data.message, token: data.token };
  } else {
    return { 
      success: false, 
      errors: data?.errors || [], 
      message: data?.message || 'Operation failed' 
    };
  }
}; 