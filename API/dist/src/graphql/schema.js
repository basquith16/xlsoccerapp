import { gql } from 'graphql-tag';
export const typeDefs = gql `
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    photo: String
    waiverSigned: Boolean!
    joinedDate: String!
    birthday: String
    active: Boolean
  }

  type Player {
    id: ID!
    name: String!
    birthDate: String!
    sex: String!
    waiverSigned: Boolean!
    isMinor: Boolean!
    profImg: String
    parent: User
  }

  type FamilyMember {
    id: ID!
    name: String!
    isMinor: Boolean!
    birthDate: String!
    sex: String!
    profImg: String
  }

  type Session {
    id: ID!
    name: String!
    sport: String!
    demo: String!
    description: String
    birthYear: Int!
    rosterLimit: Int!
    availableSpots: Int!
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
    createdAt: String!
    updatedAt: String!
  }

  type SessionSummary {
    id: ID!
    name: String!
    sport: String!
    demo: String!
    description: String
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

  type Booking {
    id: ID!
    session: SessionSummary!
    user: User!
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

  type Error {
    message: String!
    code: String!
    field: String
  }

  type AuthResponse {
    status: String!
    token: String!
    data: User
    errors: [Error!]
  }

  type PasswordResetResponse {
    status: String!
    message: String!
    errors: [Error!]
  }

  type SessionConnection {
    nodes: [Session!]!
    totalCount: Int!
    hasNextPage: Boolean!
  }

  type PaymentIntent {
    id: String!
    clientSecret: String!
    amount: Int!
    currency: String!
    status: String!
  }

  input CreateUserInput {
    name: String!
    email: String!
    password: String!
    passwordConfirm: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateUserInput {
    name: String
    email: String
    photo: String
  }

  input CreateSessionInput {
    name: String!
    sport: String!
    demo: String!
    description: String
    birthYear: Int!
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

  input CreateBookingInput {
    sessionId: ID!
    price: Float!
  }

  input CreatePaymentIntentInput {
    sessionId: ID!
    price: Float!
  }

  input CreateReviewInput {
    sessionId: ID!
    review: String!
    rating: Int!
  }

  input AddFamilyMemberInput {
    name: String!
    birthDate: String!
    sex: String!
    isMinor: Boolean!
  }

  type Query {
    # Public queries
    sessions(limit: Int = 10, offset: Int = 0): SessionConnection!
    session(id: ID!): Session
    sessionBySlug(slug: String!): Session
    
    # Protected queries (require authentication)
    me: User
    users: [User!]! # Admin only
    user(id: ID!): User # Admin only
    players: [Player!]!
    player(id: ID!): Player
    bookings: [Booking!]!
    booking(id: ID!): Booking
    reviews: [Review!]!
    review(id: ID!): Review
    
    # Family queries
    familyMembers: [FamilyMember!]!
  }

  type Mutation {
    # Authentication
    signup(input: CreateUserInput!): AuthResponse!
    login(input: LoginInput!): AuthResponse!
    logout: String!
    forgotPassword(email: String!): PasswordResetResponse!
    resetPassword(token: String!, password: String!, passwordConfirm: String!): AuthResponse!
    updatePassword(currentPassword: String!, newPassword: String!, newPasswordConfirm: String!): AuthResponse!
    
    # User operations
    updateMe(input: UpdateUserInput!): User!
    deleteMe: String!
    updateUser(id: ID!, input: UpdateUserInput!): User! # Admin only
    deleteUser(id: ID!): String! # Admin only
    
    # Session operations (Admin only)
    createSession(input: CreateSessionInput!): Session!
    updateSession(id: ID!, input: UpdateSessionInput!): Session!
    deleteSession(id: ID!): String!
    
    # Booking operations
    createBooking(input: CreateBookingInput!): Booking!
    deleteBooking(id: ID!): String!
    
    # Payment operations
    createPaymentIntent(input: CreatePaymentIntentInput!): PaymentIntent!
    
    # Review operations
    createReview(input: CreateReviewInput!): Review!
    updateReview(id: ID!, review: String!, rating: Int!): Review!
    deleteReview(id: ID!): String!
    
    # Family operations
    addFamilyMember(input: AddFamilyMemberInput!): FamilyMember!
    removeFamilyMember(memberId: ID!): String!
  }
`;
