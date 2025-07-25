import { gql } from 'graphql-tag';

// Base schema that defines the root Query and Mutation types
// All other schemas will extend these types
export const baseSchema = gql`
  # Scalar types
  scalar JSON
  scalar Upload
  scalar Date

  # Root types that other schemas will extend
  type Query {
    # Health check query
    _health: String
  }

  type Mutation {
    # Placeholder mutation
    _placeholder: String
  }

  # Common types used across schemas
  type ConnectionInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }
`;