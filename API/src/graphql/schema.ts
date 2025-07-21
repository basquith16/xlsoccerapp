import { gql } from 'graphql-tag';

export const typeDefs = gql`
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
    staffOnly: Boolean!
    slug: String!
    coverImage: String
    images: [String!]
    createdAt: String!
    updatedAt: String!
  }

  type AgeRange {
    minAge: Int!
    maxAge: Int!
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

  type Error {
    message: String!
    code: String!
    field: String
  }

  type AuthResponse {
    status: String!
    token: String
    data: User
    message: String
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

  input CreateUserInput {
    name: String!
    email: String!
    password: String!
    passwordConfirm: String!
    birthday: String!
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

  input CreateBookingInput {
    sessionId: ID!
    playerId: ID!
    price: Float!
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
    
    # Billing queries
    customer: Customer
    transactions: [Transaction!]!
    paymentMethods: [PaymentMethod!]!
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
    createSetupIntent(input: CreateSetupIntentInput!): SetupIntent!
    attachPaymentMethod(input: AttachPaymentMethodInput!): PaymentMethod!
    detachPaymentMethod(input: DetachPaymentMethodInput!): String!
    setDefaultPaymentMethod(input: SetDefaultPaymentMethodInput!): Customer!
    
    # Review operations
    createReview(input: CreateReviewInput!): Review!
    updateReview(id: ID!, review: String!, rating: Int!): Review!
    deleteReview(id: ID!): String!
    
    # Family operations
    addFamilyMember(input: AddFamilyMemberInput!): FamilyMember!
    removeFamilyMember(memberId: ID!): String!
  }
`; 