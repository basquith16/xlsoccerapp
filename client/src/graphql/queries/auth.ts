import { gql } from '@apollo/client';

export const GET_ME = gql`
  query GetMe {
    me {
      id
      name
      email
      role
      photo
      waiverSigned
      joinedDate
      birthday
      active
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      role
      photo
      waiverSigned
      joinedDate
      birthday
      active
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      role
      photo
      waiverSigned
      joinedDate
      birthday
      active
    }
  }
`;

export const GET_FAMILY_MEMBERS = gql`
  query GetFamilyMembers {
    familyMembers {
      id
      name
      isMinor
      birthDate
      sex
      profImg
    }
  }
`; 