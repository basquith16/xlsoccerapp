import { gql } from '@apollo/client';

export const SIGNUP = gql`
  mutation Signup($input: CreateUserInput!) {
    signup(input: $input) {
      status
      token
      data {
        id
        name
        email
        role
        photo
        waiverSigned
        joinedDate
        active
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      status
      token
      data {
        id
        name
        email
        role
        photo
        waiverSigned
        joinedDate
        active
      }
    }
  }
`;

export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      status
      message
      errors {
        message
        code
        field
      }
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $password: String!, $passwordConfirm: String!) {
    resetPassword(token: $token, password: $password, passwordConfirm: $passwordConfirm) {
      status
      token
      data {
        id
        name
        email
        role
        photo
        waiverSigned
        joinedDate
        active
      }
    }
  }
`;

export const UPDATE_PASSWORD = gql`
  mutation UpdatePassword($currentPassword: String!, $newPassword: String!, $newPasswordConfirm: String!) {
    updatePassword(currentPassword: $currentPassword, newPassword: $newPassword, newPasswordConfirm: $newPasswordConfirm) {
      status
      token
      data {
        id
        name
        email
        role
        photo
        waiverSigned
        joinedDate
        active
      }
    }
  }
`;

export const UPDATE_ME = gql`
  mutation UpdateMe($input: UpdateUserInput!) {
    updateMe(input: $input) {
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

export const DELETE_ME = gql`
  mutation DeleteMe {
    deleteMe
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
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

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
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