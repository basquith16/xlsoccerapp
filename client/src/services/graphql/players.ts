import { useQuery, useMutation } from '@apollo/client';
import {
  GET_PLAYERS,
  GET_ADMIN_PLAYERS,
  GET_PLAYER,
  GET_FAMILY_MEMBERS
} from '../../graphql/queries/players';
import {
  CREATE_PLAYER,
  UPDATE_PLAYER,
  DELETE_PLAYER,
  ADD_FAMILY_MEMBER,
  REMOVE_FAMILY_MEMBER
} from '../../graphql/mutations/players';

// Player Query Hooks
export const usePlayers = (limit?: number, offset?: number) => {
  return useQuery(GET_PLAYERS, {
    variables: { limit, offset },
    errorPolicy: 'all',
  });
};

export const useAdminPlayers = (limit?: number, offset?: number) => {
  return useQuery(GET_ADMIN_PLAYERS, {
    variables: { limit, offset },
    errorPolicy: 'all',
  });
};

export const usePlayer = (id: string) => {
  return useQuery(GET_PLAYER, {
    variables: { id },
    errorPolicy: 'all',
    skip: !id,
  });
};

export const useFamilyMembers = () => {
  return useQuery(GET_FAMILY_MEMBERS, {
    errorPolicy: 'all',
  });
};

// Player Mutation Hooks
export const useCreatePlayer = () => {
  return useMutation(CREATE_PLAYER, {
    refetchQueries: [
      { query: GET_ADMIN_PLAYERS },
      { query: GET_PLAYERS }
    ],
    errorPolicy: 'all',
  });
};

export const useUpdatePlayer = () => {
  return useMutation(UPDATE_PLAYER, {
    refetchQueries: [
      { query: GET_ADMIN_PLAYERS },
      { query: GET_PLAYERS }
    ],
    errorPolicy: 'all',
  });
};

export const useDeletePlayer = () => {
  return useMutation(DELETE_PLAYER, {
    refetchQueries: [
      { query: GET_ADMIN_PLAYERS },
      { query: GET_PLAYERS }
    ],
    errorPolicy: 'all',
  });
};

// Family Member Mutation Hooks (for regular users)
export const useAddFamilyMember = () => {
  return useMutation(ADD_FAMILY_MEMBER, {
    refetchQueries: [
      { query: GET_FAMILY_MEMBERS }
    ],
    errorPolicy: 'all',
  });
};

export const useRemoveFamilyMember = () => {
  return useMutation(REMOVE_FAMILY_MEMBER, {
    refetchQueries: [
      { query: GET_FAMILY_MEMBERS }
    ],
    errorPolicy: 'all',
  });
};