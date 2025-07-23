import { useQuery, useMutation } from '@apollo/client';
import { GET_USERS, GET_USER } from '../../graphql/queries/auth';
import { UPDATE_USER, DELETE_USER, SIGNUP } from '../../graphql/mutations/auth';

// Hook to get all users (admin only)
export const useUsers = () => {
  return useQuery(GET_USERS, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  });
};

// Hook to get a specific user
export const useUser = (id: string) => {
  return useQuery(GET_USER, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  });
};

// Hook to create a user (admin only)
export const useCreateUser = () => {
  return useMutation(SIGNUP, {
    refetchQueries: [{ query: GET_USERS }],
    errorPolicy: 'all'
  });
};

// Hook to update a user
export const useUpdateUser = () => {
  return useMutation(UPDATE_USER, {
    refetchQueries: [{ query: GET_USERS }],
    errorPolicy: 'all'
  });
};

// Hook to delete a user
export const useDeleteUser = () => {
  return useMutation(DELETE_USER, {
    refetchQueries: [{ query: GET_USERS }],
    errorPolicy: 'all'
  });
}; 