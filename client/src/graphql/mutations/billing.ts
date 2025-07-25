import { gql } from '@apollo/client';

export const CREATE_PAYMENT_INTENT = gql`
  mutation CreatePaymentIntent($input: CreatePaymentIntentInput!) {
    createPaymentIntent(input: $input) {
      id
      clientSecret
      amount
      currency
      status
    }
  }
`;

export const VERIFY_PAYMENT_INTENT = gql`
  mutation VerifyPaymentIntent($input: VerifyPaymentIntentInput!) {
    verifyPaymentIntent(input: $input) {
      id
      status
      customer
      amount
      paymentMethod
      setupFutureUsage
    }
  }
`;

export const CREATE_SETUP_INTENT = gql`
  mutation CreateSetupIntent($input: CreateSetupIntentInput!) {
    createSetupIntent(input: $input) {
      id
      clientSecret
      status
    }
  }
`;

export const ATTACH_PAYMENT_METHOD = gql`
  mutation AttachPaymentMethod($input: AttachPaymentMethodInput!) {
    attachPaymentMethod(input: $input) {
      id
      type
      card {
        brand
        last4
        exp_month
        exp_year
      }
      billingDetails {
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

export const DETACH_PAYMENT_METHOD = gql`
  mutation DetachPaymentMethod($input: DetachPaymentMethodInput!) {
    detachPaymentMethod(input: $input)
  }
`;

export const SET_DEFAULT_PAYMENT_METHOD = gql`
  mutation SetDefaultPaymentMethod($input: SetDefaultPaymentMethodInput!) {
    setDefaultPaymentMethod(input: $input) {
      id
      email
      name
      paymentMethods {
        id
        type
        card {
          brand
          last4
          exp_month
          exp_year
        }
      }
      defaultPaymentMethod {
        id
        type
        card {
          brand
          last4
          exp_month
          exp_year
        }
      }
    }
  }
`; 