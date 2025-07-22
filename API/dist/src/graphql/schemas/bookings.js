import { gql } from 'graphql-tag';
export const bookingSchema = gql `
  type Booking {
    id: ID!
    session: SessionSummary!
    user: User!
    player: Player!
    price: Float!
    createdAt: String!
    paid: Boolean!
  }

  type Review {
    id: ID!
    review: String!
    rating: Int!
    session: Session!
    user: User!
    createdAt: String!
  }

  input CreateBookingInput {
    sessionId: ID!
    playerId: ID!
    price: Float!
  }

  input CreateReviewInput {
    sessionId: ID!
    review: String!
    rating: Int!
  }
`;
