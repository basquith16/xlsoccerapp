import { gql } from '@apollo/client';

export const CREATE_SESSION_TEMPLATE = gql`
  mutation CreateSessionTemplate($input: CreateSessionTemplateInput!) {
    createSessionTemplate(input: $input) {
      id
      name
      sport
      demo
      description
      birthYear
      rosterLimit
      price
      trainer
      staffOnly
      slug
      coverImage
      images
      isActive
      isPubliclyVisible
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_SESSION_TEMPLATE = gql`
  mutation UpdateSessionTemplate($id: ID!, $input: UpdateSessionTemplateInput!) {
    updateSessionTemplate(id: $id, input: $input) {
      id
      name
      sport
      demo
      description
      birthYear
      rosterLimit
      price
      trainer
      staffOnly
      slug
      coverImage
      images
      isActive
      isPubliclyVisible
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_SESSION_TEMPLATE = gql`
  mutation DeleteSessionTemplate($id: ID!) {
    deleteSessionTemplate(id: $id)
  }
`;

export const CREATE_SCHEDULE_PERIOD = gql`
  mutation CreateSchedulePeriod($input: CreateSchedulePeriodInput!) {
    createSchedulePeriod(input: $input) {
      id
      template {
        id
        name
        sport
        demo
      }
      name
      startDate
      endDate
      coaches {
        id
        name
        email
      }
      capacity
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_SCHEDULE_PERIOD = gql`
  mutation UpdateSchedulePeriod($id: ID!, $input: UpdateSchedulePeriodInput!) {
    updateSchedulePeriod(id: $id, input: $input) {
      id
      template {
        id
        name
        sport
        demo
      }
      name
      startDate
      endDate
      coaches {
        id
        name
        email
      }
      capacity
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_SCHEDULE_PERIOD = gql`
  mutation DeleteSchedulePeriod($id: ID!) {
    deleteSchedulePeriod(id: $id)
  }
`;

export const CREATE_SESSION_INSTANCE = gql`
  mutation CreateSessionInstance($input: CreateSessionInstanceInput!) {
    createSessionInstance(input: $input) {
      id
      period {
        id
        name
        startDate
        endDate
      }
      template {
        id
        name
        sport
        demo
      }
      name
      date
      startTime
      endTime
      coaches {
        id
        name
        email
      }
      capacity
      bookedCount
      isActive
      isCancelled
      notes
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_SESSION_INSTANCE = gql`
  mutation UpdateSessionInstance($id: ID!, $input: UpdateSessionInstanceInput!) {
    updateSessionInstance(id: $id, input: $input) {
      id
      period {
        id
        name
        startDate
        endDate
      }
      template {
        id
        name
        sport
        demo
      }
      name
      date
      startTime
      endTime
      coaches {
        id
        name
        email
      }
      capacity
      bookedCount
      isActive
      isCancelled
      notes
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_SESSION_INSTANCE = gql`
  mutation DeleteSessionInstance($id: ID!) {
    deleteSessionInstance(id: $id)
  }
`;

export const GENERATE_INSTANCES_FROM_PERIOD = gql`
  mutation GenerateInstancesFromPeriod($periodId: ID!, $startDate: String!, $endDate: String!, $daysOfWeek: [Int!]!, $startTime: String!, $endTime: String!) {
    generateInstancesFromPeriod(periodId: $periodId, startDate: $startDate, endDate: $endDate, daysOfWeek: $daysOfWeek, startTime: $startTime, endTime: $endTime) {
      id
      name
      date
      startTime
      endTime
      capacity
      bookedCount
      isActive
      isCancelled
      createdAt
      updatedAt
      templateInfo {
        id
        name
        sport
        demo
      }
      periodInfo {
        id
        name
        startDate
        endDate
      }
    }
  }
`; 