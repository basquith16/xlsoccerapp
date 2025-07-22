import { gql } from '@apollo/client';

export const GET_SESSION_TEMPLATES = gql`
  query GetSessionTemplates($limit: Int = 10, $offset: Int = 0) {
    sessionTemplates(limit: $limit, offset: $offset) {
      nodes {
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
        activePeriodsCount
        upcomingInstancesCount
      }
      totalCount
      hasNextPage
    }
  }
`;

export const GET_ADMIN_SESSION_TEMPLATES = gql`
  query GetAdminSessionTemplates($limit: Int = 10, $offset: Int = 0) {
    adminSessionTemplates(limit: $limit, offset: $offset) {
      nodes {
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
        activePeriodsCount
        upcomingInstancesCount
      }
      totalCount
      hasNextPage
    }
  }
`;

export const GET_SESSION_TEMPLATE = gql`
  query GetSessionTemplate($id: ID!) {
    sessionTemplate(id: $id) {
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
      periods {
        id
        name
        startDate
        endDate
        capacity
        isActive
        isCurrentlyActive
        isUpcoming
        isPast
        instancesCount
        activeInstancesCount
      }
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
        isAvailable
        isFull
        isPast
        isUpcoming
        isToday
        isThisWeek
        isThisMonth
        availableSpots
        bookingPercentage
      }
      activePeriodsCount
      upcomingInstancesCount
    }
  }
`;

export const GET_SESSION_TEMPLATE_BY_SLUG = gql`
  query GetSessionTemplateBySlug($slug: String!) {
    sessionTemplateBySlug(slug: $slug) {
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
      periods {
        id
        name
        startDate
        endDate
        capacity
        isActive
        isCurrentlyActive
        isUpcoming
        isPast
        instancesCount
        activeInstancesCount
      }
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
        isAvailable
        isFull
        isPast
        isUpcoming
        isToday
        isThisWeek
        isThisMonth
        availableSpots
        bookingPercentage
      }
      activePeriodsCount
      upcomingInstancesCount
    }
  }
`; 