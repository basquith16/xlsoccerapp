import { gql } from '@apollo/client';
import { PLAYER_FIELDS } from '../fragments';

export const GET_PLAYERS = gql`
  query GetPlayers($limit: Int = 50, $offset: Int = 0) {
    players(limit: $limit, offset: $offset) {
      nodes {
        ...PlayerFields
        parent {
          id
          name
          email
        }
      }
      totalCount
      hasNextPage
    }
  }
  ${PLAYER_FIELDS}
`;

export const GET_ADMIN_PLAYERS = gql`
  query GetAdminPlayers($limit: Int = 50, $offset: Int = 0) {
    adminPlayers(limit: $limit, offset: $offset) {
      nodes {
        ...PlayerFields
        parent {
          id
          name
          email
          role
        }
      }
      totalCount
      hasNextPage
    }
  }
  ${PLAYER_FIELDS}
`;

export const GET_PLAYER = gql`
  query GetPlayer($id: ID!) {
    player(id: $id) {
      ...PlayerFields
      parent {
        id
        name
        email
        role
      }
    }
  }
  ${PLAYER_FIELDS}
`;

export const GET_FAMILY_MEMBERS = gql`
  query GetFamilyMembers {
    familyMembers {
      ...PlayerFields
    }
  }
  ${PLAYER_FIELDS}
`;