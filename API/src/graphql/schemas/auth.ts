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
    familyMembers: [FamilyMember!]
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

  type PlayerConnection {
    nodes: [Player!]!
    totalCount: Int!
    hasNextPage: Boolean!
  }

  type UserConnection {
    nodes: [User!]!
    totalCount: Int!
    hasNextPage: Boolean!
  }

  type Error {
    message: String!
    code: String!
    field: String
  }

  type AuthResponse {
    status: String!
    data: User
    message: String
    errors: [Error!]
  }

  type LogoutResponse {
    status: String!
    message: String!
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
    role: String
    active: Boolean
    waiverSigned: Boolean
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateUserInput {
    name: String
    email: String
    photo: String
    role: String
    active: Boolean
    waiverSigned: Boolean
  }

  input AddFamilyMemberInput {
    name: String!
    birthDate: String!
    sex: String!
    isMinor: Boolean!
  }

  input CreatePlayerInput {
    name: String!
    birthDate: String!
    sex: String!
    parentId: ID!
    waiverSigned: Boolean
    profImg: String
  }

  input UpdatePlayerInput {
    name: String
    birthDate: String
    sex: String
    parentId: ID
    waiverSigned: Boolean
    profImg: String
  }
`; 