import { gql } from '@apollo/client';

export const GET_ADMIN_COACHES = gql`
  query GetAdminCoaches {
    adminCoaches {
      id
      name
      email
      role
    }
  }
`; 