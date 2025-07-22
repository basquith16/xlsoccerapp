import { gql } from 'graphql-tag';
export const mutationSchema = gql `
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
