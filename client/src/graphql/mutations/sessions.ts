import { gql } from '@apollo/client';

export const CREATE_SESSION = gql`
  mutation CreateSession($input: CreateSessionInput!) {
    createSession(input: $input) {
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

export const UPDATE_SESSION = gql`
  mutation UpdateSession($id: ID!, $input: UpdateSessionInput!) {
    updateSession(id: $id, input: $input) {
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

export const DELETE_SESSION = gql`
  mutation DeleteSession($id: ID!) {
    deleteSession(id: $id)
  }
`; 