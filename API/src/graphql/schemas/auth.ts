import { gql } from 'graphql-tag';

export const authSchema = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    photo: String
    waiverSigned: Boolean!
    joinedDate: String!
    birthday: String
    active: Boolean
  }

  type Player {
    id: ID!
    name: String!
    birthDate: String!
    sex: String!
    waiverSigned: Boolean!
    isMinor: Boolean!
    profImg: String
    parent: User
  }

  type FamilyMember {
    id: ID!
    name: String!
    isMinor: Boolean!
    birthDate: String!
    sex: String!
    profImg: String
  }

  type Error {
    message: String!
    code: String!
    field: String
  }

  type AuthResponse {
    status: String!
    token: String
    data: User
    message: String
    errors: [Error!]
  }

  type PasswordResetResponse {
    status: String!
    message: String!
    errors: [Error!]
  }

  input CreateUserInput {
    name: String!
    email: String!
    password: String!
    passwordConfirm: String!
    birthday: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateUserInput {
    name: String
    email: String
    photo: String
  }

  input AddFamilyMemberInput {
    name: String!
    birthDate: String!
    sex: String!
    isMinor: Boolean!
  }
`; 