import { gql } from '@apollo/client';

export const CREATE_BOOKING = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
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

export const DELETE_BOOKING = gql`
  mutation DeleteBooking($id: ID!) {
    deleteBooking(id: $id)
  }
`;

export const CREATE_REVIEW = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
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

export const UPDATE_REVIEW = gql`
  mutation UpdateReview($id: ID!, $review: String!, $rating: Int!) {
    updateReview(id: $id, review: $review, rating: $rating) {
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

export const DELETE_REVIEW = gql`
  mutation DeleteReview($id: ID!) {
    deleteReview(id: $id)
  }
`; 