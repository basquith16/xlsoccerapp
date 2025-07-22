import { gql } from '@apollo/client';

export const GET_SESSION_INSTANCES = gql`
  query GetSessionInstances($limit: Int = 10, $offset: Int = 0) {
    sessionInstances(limit: $limit, offset: $offset) {
      nodes {
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
      totalCount
      hasNextPage
    }
  }
`;

export const GET_ADMIN_SESSION_INSTANCES = gql`
  query GetAdminSessionInstances($limit: Int = 10, $offset: Int = 0) {
    adminSessionInstances(limit: $limit, offset: $offset) {
      nodes {
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
      totalCount
      hasNextPage
    }
  }
`;

export const GET_SESSION_INSTANCE = gql`
  query GetSessionInstance($id: ID!) {
    sessionInstance(id: $id) {
      id
      period {
        id
        name
        startDate
        endDate
        capacity
        isActive
      }
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
  }
`;

export const GET_SESSION_INSTANCES_BY_PERIOD = gql`
  query GetSessionInstancesByPeriod($periodId: ID!, $limit: Int = 10, $offset: Int = 0) {
    sessionInstancesByPeriod(periodId: $periodId, limit: $limit, offset: $offset) {
      nodes {
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
      totalCount
      hasNextPage
    }
  }
`;

export const GET_SESSION_INSTANCES_BY_TEMPLATE = gql`
  query GetSessionInstancesByTemplate($templateId: ID!, $limit: Int = 10, $offset: Int = 0) {
    sessionInstancesByTemplate(templateId: $templateId, limit: $limit, offset: $offset) {
      nodes {
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
      totalCount
      hasNextPage
    }
  }
`; 