import { gql } from '@apollo/client';

export const GET_CUSTOMER = gql`
  query GetCustomer {
    customer {
      id
      email
      name
      paymentMethods {
        id
        type
        card {
          id
          brand
          last4
          exp_month
          exp_year
          fingerprint
        }
        billingDetails {
          id
          name
          email
          address {
            line1
            line2
            city
            state
            postalCode
            country
          }
        }
      }
      defaultPaymentMethod {
        id
        type
        card {
          id
          brand
          last4
          exp_month
          exp_year
          fingerprint
        }
      }
    }
  }
`;

export const GET_TRANSACTIONS = gql`
  query GetTransactions {
    transactions {
      id
      amount
      currency
      status
      description
      createdAt
      paymentMethod {
        id
        type
        card {
          id
          brand
          last4
          exp_month
          exp_year
        }
      }
    }
  }
`;

export const GET_PAYMENT_METHODS = gql`
  query GetPaymentMethods {
    paymentMethods {
      id
      type
      card {
        id
        brand
        last4
        exp_month
        exp_year
        fingerprint
      }
      billingDetails {
        id
        name
        email
        address {
          line1
          line2
          city
          state
          postalCode
          country
        }
      }
    }
  }
`; 