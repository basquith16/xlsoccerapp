import { gql } from '@apollo/client';

export const GET_SESSIONS = gql`
  query GetSessions($limit: Int = 10, $offset: Int = 0) {
    sessions(limit: $limit, offset: $offset) {
      nodes {
        id
        name
        sport
        demo
        description
        birthYear
        ageRange {
          minAge
          maxAge
        }
        price
        priceDiscount
        startDates
        endDate
        timeStart
        timeEnd
        trainer
        trainers {
          id
          name
        }
        staffOnly
        isActive
        isPubliclyVisible
        slug
        coverImage
        images
        availableSpots
        rosterLimit
        createdAt
        updatedAt
      }
      totalCount
      hasNextPage
    }
  }
`;

export const GET_ADMIN_SESSIONS = gql`
  query GetAdminSessions($limit: Int = 10, $offset: Int = 0) {
    adminSessions(limit: $limit, offset: $offset) {
      nodes {
        id
        name
        sport
        demo
        description
        birthYear
        ageRange {
          minAge
          maxAge
        }
        price
        priceDiscount
        startDates
        endDate
        timeStart
        timeEnd
        trainer
        trainers {
          id
          name
        }
        staffOnly
        isActive
        isPubliclyVisible
        slug
        coverImage
        images
        availableSpots
        rosterLimit
        createdAt
        updatedAt
      }
      totalCount
      hasNextPage
    }
  }
`;

export const GET_SESSION = gql`
  query GetSession($id: ID!) {
    session(id: $id) {
      id
      name
      sport
      demo
      description
      birthYear
      ageRange {
        minAge
        maxAge
      }
      price
      priceDiscount
      startDates
      endDate
      timeStart
      timeEnd
      trainer
      trainers {
        id
        name
      }
      staffOnly
      isActive
      isPubliclyVisible
      slug
      coverImage
      images
      availableSpots
      rosterLimit
      createdAt
      updatedAt
    }
  }
`;

export const GET_SESSION_BY_SLUG = gql`
  query GetSessionBySlug($slug: String!) {
    sessionBySlug(slug: $slug) {
      id
      name
      sport
      demo
      description
      birthYear
      ageRange {
        minAge
        maxAge
      }
      price
      priceDiscount
      startDates
      endDate
      timeStart
      timeEnd
      trainer
      trainers {
        id
        name
      }
      staffOnly
      isActive
      isPubliclyVisible
      slug
      coverImage
      images
      availableSpots
      rosterLimit
      createdAt
      updatedAt
    }
  }
`; 