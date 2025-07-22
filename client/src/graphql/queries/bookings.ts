import { gql } from '@apollo/client';

export const GET_BOOKINGS = gql`
  query GetBookings {
    bookings {
      id
      session {
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
      price
      createdAt
      paid
    }
  }
`;

export const GET_BOOKING = gql`
  query GetBooking($id: ID!) {
    booking(id: $id) {
      id
      session {
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
      price
      createdAt
      paid
    }
  }
`;

export const GET_PLAYERS = gql`
  query GetPlayers {
    players {
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
      }
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
      }
    }
  }
`;

export const GET_REVIEWS = gql`
  query GetReviews {
    reviews {
      id
      review
      rating
      session {
        id
        name
        sport
        demo
      }
      user {
        id
        name
        email
      }
      createdAt
    }
  }
`;

export const GET_REVIEW = gql`
  query GetReview($id: ID!) {
    review(id: $id) {
      id
      review
      rating
      session {
        id
        name
        sport
        demo
      }
      user {
        id
        name
        email
      }
      createdAt
    }
  }
`; 