import { gql } from 'graphql-tag';

export const templateSchema = gql`
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
`; 