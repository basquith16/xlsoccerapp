import { useQuery, useMutation } from '@apollo/client';
import {
  GET_CUSTOMER,
  GET_TRANSACTIONS,
  GET_PAYMENT_METHODS
} from '../../graphql/queries';
import {
  CREATE_PAYMENT_INTENT,
  CREATE_SETUP_INTENT,
  ATTACH_PAYMENT_METHOD,
  DETACH_PAYMENT_METHOD,
  SET_DEFAULT_PAYMENT_METHOD
} from '../../graphql/mutations';

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

export const useCreatePaymentIntent = () => {
  return useMutation(CREATE_PAYMENT_INTENT);
};

export const useCreateSetupIntent = () => {
  return useMutation(CREATE_SETUP_INTENT);
};

export const useAttachPaymentMethod = () => {
  return useMutation(ATTACH_PAYMENT_METHOD, {
    refetchQueries: [
      { query: GET_CUSTOMER },
      { query: GET_PAYMENT_METHODS }
    ]
  });
};

export const useDetachPaymentMethod = () => {
  return useMutation(DETACH_PAYMENT_METHOD, {
    refetchQueries: [
      { query: GET_CUSTOMER },
      { query: GET_PAYMENT_METHODS }
    ]
  });
};

export const useSetDefaultPaymentMethod = () => {
  return useMutation(SET_DEFAULT_PAYMENT_METHOD, {
    refetchQueries: [
      { query: GET_CUSTOMER },
      { query: GET_PAYMENT_METHODS }
    ]
  });
}; 