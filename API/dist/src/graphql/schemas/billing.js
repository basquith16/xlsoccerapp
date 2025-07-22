import { gql } from 'graphql-tag';
export const billingSchema = gql `
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
`;
