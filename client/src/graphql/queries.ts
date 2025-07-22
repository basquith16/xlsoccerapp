import { gql } from '@apollo/client';

// User Queries
export const GET_ME = gql`
  query GetMe {
    me {
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

// Admin Session Queries
export const GET_ADMIN_SESSIONS = gql`
  query GetAdminSessions($limit: Int = 10, $offset: Int = 0) {
    adminSessions(limit: $limit, offset: $offset) {
      nodes {
        id
        name
        sport
        demo
        description
        birthYear
        ageRange {
          minAge
          maxAge
        }
        price
        priceDiscount
        startDates
        endDate
        timeStart
        timeEnd
        trainer
        trainers {
          id
          name
        }
        staffOnly
        isActive
        isPubliclyVisible
        slug
        coverImage
        images
        availableSpots
        rosterLimit
        createdAt
        updatedAt
      }
      totalCount
      hasNextPage
    }
  }
`;

// Session Queries
export const GET_SESSIONS = gql`
  query GetSessions($limit: Int = 10, $offset: Int = 0) {
    sessions(limit: $limit, offset: $offset) {
      nodes {
        id
        name
        sport
        demo
        description
        birthYear
        ageRange {
          minAge
          maxAge
        }
        price
        priceDiscount
        startDates
        endDate
        timeStart
        timeEnd
        trainer
        trainers {
          id
          name
        }
        staffOnly
        isActive
        isPubliclyVisible
        slug
        coverImage
        images
        availableSpots
        rosterLimit
        createdAt
        updatedAt
      }
      totalCount
      hasNextPage
    }
  }
`;

export const GET_SESSION = gql`
  query GetSession($id: ID!) {
    session(id: $id) {
      id
      name
      sport
      demo
      description
      birthYear
      ageRange {
        minAge
        maxAge
      }
      price
      priceDiscount
      startDates
      endDate
      timeStart
      timeEnd
      trainer
      staffOnly
      slug
      coverImage
      images
      availableSpots
      createdAt
      updatedAt
    }
  }
`;

export const GET_SESSION_BY_SLUG = gql`
  query GetSessionBySlug($slug: String!) {
    sessionBySlug(slug: $slug) {
      id
      name
      sport
      demo
      description
      ageRange {
        minAge
        maxAge
      }
      rosterLimit
      price
      priceDiscount
      startDates
      endDate
      timeStart
      timeEnd
      trainer
      staffOnly
      slug
      coverImage
      images
      availableSpots
      createdAt
      updatedAt
    }
  }
`;

// Player Queries
export const GET_PLAYERS = gql`
  query GetPlayers {
    players {
      nodes {
        id
        name
        birthDate
        sex
        waiverSigned
        isMinor
        profImg
        parent {
          id
          name
          email
          role
          photo
        }
      }
      totalCount
    }
  }
`;

export const GET_PLAYER = gql`
  query GetPlayer($id: ID!) {
    player(id: $id) {
      id
      name
      birthDate
      sex
      waiverSigned
      isMinor
      profImg
      parent {
        id
        name
        email
        role
        photo
      }
    }
  }
`;

// Booking Queries
export const GET_MY_BOOKINGS = gql`
  query GetMyBookings {
    bookings {
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
        description
        slug
        coverImage
        images
        availableSpots
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

// Review Queries
export const GET_REVIEWS = gql`
  query GetReviews {
    reviews {
      nodes {
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
      totalCount
    }
  }
`;

// Family Queries
export const GET_FAMILY_MEMBERS = gql`
  query GetFamilyMembers {
    familyMembers {
      id
      name
      isMinor
      birthDate
      sex
      profImg
    }
  }
`;

// Billing Queries
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
      }
    }
  }
`; 