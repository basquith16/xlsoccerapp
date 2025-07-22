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

  # New Session Template + Schedule Periods + Instances Types
  type SessionTemplate {
    id: ID!
    name: String!
    sport: String!
    demo: String!
    description: String!
    birthYear: String!
    rosterLimit: Int!
    price: Float!
    trainer: String
    staffOnly: Boolean!
    slug: String!
    coverImage: String
    images: [String!]
    isActive: Boolean!
    isPubliclyVisible: Boolean!
    createdAt: String!
    updatedAt: String!
    # Virtual relationships
    periods: [SchedulePeriod!]
    instances: [SessionInstance!]
    activePeriodsCount: Int
    upcomingInstancesCount: Int
  }

  type SchedulePeriod {
    id: ID!
    template: SessionTemplate!
    name: String!
    startDate: String!
    endDate: String!
    coaches: [User!]
    capacity: Int!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
    # Virtual properties
    isCurrentlyActive: Boolean!
    isUpcoming: Boolean!
    isPast: Boolean!
    # Virtual relationships
    templateInfo: SessionTemplate
    instances: [SessionInstance!]
    instancesCount: Int
    activeInstancesCount: Int
  }

  type SessionInstance {
    id: ID!
    period: SchedulePeriod!
    template: SessionTemplate!
    name: String!
    date: String!
    startTime: String!
    endTime: String!
    coaches: [User!]
    capacity: Int!
    bookedCount: Int!
    isActive: Boolean!
    isCancelled: Boolean!
    notes: String
    createdAt: String!
    updatedAt: String!
    # Virtual properties
    isAvailable: Boolean!
    isFull: Boolean!
    isPast: Boolean!
    isUpcoming: Boolean!
    isToday: Boolean!
    isThisWeek: Boolean!
    isThisMonth: Boolean!
    availableSpots: Int!
    bookingPercentage: Int!
    # Virtual relationships
    templateInfo: SessionTemplate
    periodInfo: SchedulePeriod
    coachInfo: [User!]
  }

  type SessionTemplateConnection {
    nodes: [SessionTemplate!]!
    totalCount: Int!
    hasNextPage: Boolean!
  }

  type SchedulePeriodConnection {
    nodes: [SchedulePeriod!]!
    totalCount: Int!
    hasNextPage: Boolean!
  }

  type SessionInstanceConnection {
    nodes: [SessionInstance!]!
    totalCount: Int!
    hasNextPage: Boolean!
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

  # New Input Types for Session Template + Schedule Periods + Instances
  input CreateSessionTemplateInput {
    name: String!
    sport: String!
    demo: String!
    description: String!
    birthYear: String!
    rosterLimit: Int!
    price: Float!
    trainer: String
    staffOnly: Boolean!
    slug: String!
    coverImage: String
    images: [String!]
    isActive: Boolean
  }

  input UpdateSessionTemplateInput {
    name: String
    sport: String
    demo: String
    description: String
    birthYear: String
    rosterLimit: Int
    price: Float
    trainer: String
    staffOnly: Boolean
    slug: String
    coverImage: String
    images: [String!]
    isActive: Boolean
  }

  input CreateSchedulePeriodInput {
    templateId: ID!
    name: String!
    startDate: String!
    endDate: String!
    coachIds: [ID!]!
    capacity: Int!
    isActive: Boolean
  }

  input UpdateSchedulePeriodInput {
    name: String
    startDate: String
    endDate: String
    coachIds: [ID!]
    capacity: Int
    isActive: Boolean
  }

  input CreateSessionInstanceInput {
    periodId: ID!
    templateId: ID!
    name: String!
    date: String!
    startTime: String!
    endTime: String!
    coachIds: [ID!]
    capacity: Int!
    notes: String
    isActive: Boolean
  }

  input UpdateSessionInstanceInput {
    name: String
    date: String
    startTime: String
    endTime: String
    coachIds: [ID!]
    capacity: Int
    bookedCount: Int
    notes: String
    isActive: Boolean
    isCancelled: Boolean
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
    adminSessions(limit: Int = 10, offset: Int = 0): SessionConnection! # Admin only
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
    
    # New Session Template + Schedule Periods + Instances queries
    sessionTemplates(limit: Int = 10, offset: Int = 0): SessionTemplateConnection!
    sessionTemplate(id: ID!): SessionTemplate
    sessionTemplateBySlug(slug: String!): SessionTemplate
    
    schedulePeriods(limit: Int = 10, offset: Int = 0): SchedulePeriodConnection!
    schedulePeriod(id: ID!): SchedulePeriod
    schedulePeriodsByTemplate(templateId: ID!, limit: Int = 10, offset: Int = 0): SchedulePeriodConnection!
    
    sessionInstances(limit: Int = 10, offset: Int = 0): SessionInstanceConnection!
    sessionInstance(id: ID!): SessionInstance
    sessionInstancesByPeriod(periodId: ID!, limit: Int = 10, offset: Int = 0): SessionInstanceConnection!
    sessionInstancesByTemplate(templateId: ID!, limit: Int = 10, offset: Int = 0): SessionInstanceConnection!
    
    # Admin queries for new structure
    adminSessionTemplates(limit: Int = 10, offset: Int = 0): SessionTemplateConnection! # Admin only
    adminSchedulePeriods(limit: Int = 10, offset: Int = 0): SchedulePeriodConnection! # Admin only
    adminSessionInstances(limit: Int = 10, offset: Int = 0): SessionInstanceConnection! # Admin only
    adminCoaches: [User!]! # Admin only - Get all coaches
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
    
    # New Session Template + Schedule Periods + Instances mutations (Admin only)
    createSessionTemplate(input: CreateSessionTemplateInput!): SessionTemplate!
    updateSessionTemplate(id: ID!, input: UpdateSessionTemplateInput!): SessionTemplate!
    deleteSessionTemplate(id: ID!): String!
    
    createSchedulePeriod(input: CreateSchedulePeriodInput!): SchedulePeriod!
    updateSchedulePeriod(id: ID!, input: UpdateSchedulePeriodInput!): SchedulePeriod!
    deleteSchedulePeriod(id: ID!): String!
    
    createSessionInstance(input: CreateSessionInstanceInput!): SessionInstance!
    updateSessionInstance(id: ID!, input: UpdateSessionInstanceInput!): SessionInstance!
    deleteSessionInstance(id: ID!): String!
    
    # Bulk operations for instances (Admin only)
    generateInstancesFromPeriod(periodId: ID!, startDate: String!, endDate: String!, daysOfWeek: [Int!]!, startTime: String!, endTime: String!): [SessionInstance!]!
  }
`;
