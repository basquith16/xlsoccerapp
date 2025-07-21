import { gql } from '@apollo/client';

// Authentication Mutations
export const SIGNUP = gql`
  mutation Signup($input: CreateUserInput!) {
    signup(input: $input) {
      status
      token
      data {
        id
        name
        email
        role
        photo
        waiverSigned
        joinedDate
        active
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      status
      token
      data {
        id
        name
        email
        role
        photo
        waiverSigned
        joinedDate
        active
      }
    }
  }
`;

export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      status
      message
      errors {
        message
        code
        field
      }
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $password: String!, $passwordConfirm: String!) {
    resetPassword(token: $token, password: $password, passwordConfirm: $passwordConfirm) {
      status
      token
      data {
        id
        name
        email
        role
        photo
        waiverSigned
        joinedDate
        active
      }
    }
  }
`;

export const UPDATE_PASSWORD = gql`
  mutation UpdatePassword($currentPassword: String!, $newPassword: String!, $newPasswordConfirm: String!) {
    updatePassword(currentPassword: $currentPassword, newPassword: $newPassword, newPasswordConfirm: $newPasswordConfirm) {
      status
      token
      data {
        id
        name
        email
        role
        photo
        waiverSigned
        joinedDate
        active
      }
    }
  }
`;

export const UPDATE_ME = gql`
  mutation UpdateMe($input: UpdateUserInput!) {
    updateMe(input: $input) {
      id
      name
      email
      role
      photo
      waiverSigned
      joinedDate
      birthday
      active
    }
  }
`;

// Booking Mutations
export const CREATE_BOOKING = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
      price
      paid
      createdAt
      session {
        id
        name
        sport
        demo
        birthYear
        ageRange {
          minAge
          maxAge
        }
        price
        startDates
        timeStart
        timeEnd
      }
      user {
        id
        name
        email
      }
      player {
        id
        name
        birthDate
        sex
        waiverSigned
        isMinor
        profImg
      }
    }
  }
`;

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

// Review Mutations
export const CREATE_REVIEW = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      review
      rating
      session {
        id
        name
      }
      user {
        id
        name
        photo
      }
      createdAt
    }
  }
`;

// Family Mutations
export const ADD_FAMILY_MEMBER = gql`
  mutation AddFamilyMember($input: AddFamilyMemberInput!) {
    addFamilyMember(input: $input) {
      id
      name
      isMinor
      birthDate
      sex
      profImg
    }
  }
`;

export const REMOVE_FAMILY_MEMBER = gql`
  mutation RemoveFamilyMember($memberId: ID!) {
    removeFamilyMember(memberId: $memberId)
  }
`;

// Billing Mutations
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