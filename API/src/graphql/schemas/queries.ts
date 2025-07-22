import { gql } from 'graphql-tag';

export const querySchema = gql`
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
`; 