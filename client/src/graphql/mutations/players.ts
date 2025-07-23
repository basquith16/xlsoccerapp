import { gql } from '@apollo/client';
import { PLAYER_FIELDS } from '../fragments';

export const CREATE_PLAYER = gql`
  mutation CreatePlayer($input: CreatePlayerInput!) {
    createPlayer(input: $input) {
      ...PlayerFields
      parent {
        id
        name
        email
      }
    }
  }
  ${PLAYER_FIELDS}
`;

export const UPDATE_PLAYER = gql`
  mutation UpdatePlayer($id: ID!, $input: UpdatePlayerInput!) {
    updatePlayer(id: $id, input: $input) {
      ...PlayerFields
      parent {
        id
        name
        email
      }
    }
  }
  ${PLAYER_FIELDS}
`;

export const DELETE_PLAYER = gql`
  mutation DeletePlayer($id: ID!) {
    deletePlayer(id: $id)
  }
`;

export const ADD_FAMILY_MEMBER = gql`
  mutation AddFamilyMember($input: AddFamilyMemberInput!) {
    addFamilyMember(input: $input) {
      id
      name
      isMinor
      birthDate
      sex
      profImg
    }
  }
`;

export const REMOVE_FAMILY_MEMBER = gql`
  mutation RemoveFamilyMember($memberId: ID!) {
    removeFamilyMember(memberId: $memberId)
  }
`;