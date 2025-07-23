import { gql } from 'graphql-tag';

export const sessionSchema = gql`
  type Session {
    id: ID!
    name: String!
    sport: String!
    demo: String!
    description: String
    birthYear: Int
    ageRange: AgeRange
    rosterLimit: Int!
    availableSpots: Int!
    price: Float!
    priceDiscount: Float
    startDates: [String!]!
    endDate: String!
    timeStart: String!
    timeEnd: String!
    trainer: String
    trainers: [User!]
    staffOnly: Boolean!
    isActive: Boolean!
    isPubliclyVisible: Boolean!
    slug: String!
    coverImage: String
    images: [String!]
    createdAt: String!
    updatedAt: String!
  }

  type SessionSummary {
    id: ID!
    name: String!
    sport: String!
    demo: String!
    description: String
    birthYear: Int
    ageRange: AgeRange
    price: Float!
    priceDiscount: Float
    startDates: [String!]!
    endDate: String!
    timeStart: String!
    timeEnd: String!
    trainer: String
    staffOnly: Boolean!
    slug: String!
    coverImage: String
    images: [String!]
    availableSpots: Int!
    createdAt: String!
    updatedAt: String!
  }

  type SessionConnection {
    nodes: [Session!]!
    totalCount: Int!
    hasNextPage: Boolean!
  }

  type AgeRange {
    minAge: Int
    maxAge: Int
  }

  input CreateSessionInput {
    name: String!
    sport: String!
    demo: String!
    description: String
    birthYear: Int
    ageRange: String!
    rosterLimit: Int!
    price: Float!
    priceDiscount: Float
    startDates: [String!]!
    endDate: String!
    timeStart: String!
    timeEnd: String!
    trainer: String
    staffOnly: Boolean!
    coverImage: String
    images: [String!]
  }

  input UpdateSessionInput {
    name: String
    sport: String
    demo: String
    description: String
    birthYear: Int
    ageRange: String
    rosterLimit: Int
    price: Float
    priceDiscount: Float
    startDates: [String!]
    endDate: String
    timeStart: String
    timeEnd: String
    trainer: String
    staffOnly: Boolean
    coverImage: String
    images: [String!]
  }
`; 