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
      session {
        id
        name
        price
        coverImage
        slug
        trainer
        startDates
      }
      user {
        id
        name
        email
      }
      price
      createdAt
      paid
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