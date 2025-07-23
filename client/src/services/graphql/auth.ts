import { useQuery, useMutation } from '@apollo/client';
import { GET_ME } from '../../graphql/queries';
import {
  SIGNUP,
  LOGIN,
  FORGOT_PASSWORD,
  RESET_PASSWORD,
  UPDATE_PASSWORD,
  UPDATE_ME,
  DELETE_ME,
  ADD_FAMILY_MEMBER,
  REMOVE_FAMILY_MEMBER
} from '../../graphql/mutations';

// Authentication Hooks
export const useSignup = () => {
  return useMutation(SIGNUP);
};

export const useLogin = () => {
  return useMutation(LOGIN);
};

export const useForgotPassword = () => {
  return useMutation(FORGOT_PASSWORD);
};

export const useResetPassword = () => {
  return useMutation(RESET_PASSWORD);
};

export const useUpdatePassword = () => {
  return useMutation(UPDATE_PASSWORD);
};

export const useUpdateMe = () => {
  return useMutation(UPDATE_ME);
};

export const useDeleteMe = () => {
  return useMutation(DELETE_ME);
};

export const useAddFamilyMember = () => {
  return useMutation(ADD_FAMILY_MEMBER);
};

export const useRemoveFamilyMember = () => {
  return useMutation(REMOVE_FAMILY_MEMBER);
};

// User Hooks
export const useMe = () => {
  const token = localStorage.getItem('token');
  return useQuery(GET_ME, {
    errorPolicy: 'all',
    skip: !token, // Skip the query if no token exists
  });
}; 