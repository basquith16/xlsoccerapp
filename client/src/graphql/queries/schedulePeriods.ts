import { gql } from '@apollo/client';

export const GET_SCHEDULE_PERIODS = gql`
  query GetSchedulePeriods($limit: Int = 10, $offset: Int = 0) {
    schedulePeriods(limit: $limit, offset: $offset) {
      nodes {
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
        isCurrentlyActive
        isUpcoming
        isPast
        createdAt
        updatedAt
        instancesCount
        activeInstancesCount
      }
      totalCount
      hasNextPage
    }
  }
`;

export const GET_ADMIN_SCHEDULE_PERIODS = gql`
  query GetAdminSchedulePeriods($limit: Int = 10, $offset: Int = 0) {
    adminSchedulePeriods(limit: $limit, offset: $offset) {
      nodes {
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
        isCurrentlyActive
        isUpcoming
        isPast
        createdAt
        updatedAt
        instancesCount
        activeInstancesCount
      }
      totalCount
      hasNextPage
    }
  }
`;

export const GET_SCHEDULE_PERIOD = gql`
  query GetSchedulePeriod($id: ID!) {
    schedulePeriod(id: $id) {
      id
      template {
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
      isCurrentlyActive
      isUpcoming
      isPast
      createdAt
      updatedAt
      instances {
        id
        name
        date
        startTime
        endTime
        capacity
        bookedCount
        isActive
        isCancelled
        notes
        isAvailable
        isFull
        isPast
        isUpcoming
        isToday
        isThisWeek
        isThisMonth
        availableSpots
        bookingPercentage
        createdAt
        updatedAt
      }
      instancesCount
      activeInstancesCount
    }
  }
`;

export const GET_SCHEDULE_PERIODS_BY_TEMPLATE = gql`
  query GetSchedulePeriodsByTemplate($templateId: ID!, $limit: Int = 10, $offset: Int = 0) {
    schedulePeriodsByTemplate(templateId: $templateId, limit: $limit, offset: $offset) {
      nodes {
        id
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
        isCurrentlyActive
        isUpcoming
        isPast
        createdAt
        updatedAt
        instancesCount
        activeInstancesCount
      }
      totalCount
      hasNextPage
    }
  }
`; 