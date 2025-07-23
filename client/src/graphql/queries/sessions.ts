import { gql } from '@apollo/client';
import { SESSION_FIELDS, SESSION_ADMIN_FIELDS, SESSION_BASIC_FIELDS } from '../fragments';

export const GET_SESSIONS = gql`
  query GetSessions($limit: Int = 10, $offset: Int = 0) {
    sessions(limit: $limit, offset: $offset) {
      nodes {
        ...SessionFields
      }
      totalCount
      hasNextPage
    }
  }
  ${SESSION_FIELDS}
`;

export const GET_ADMIN_SESSIONS = gql`
  query GetAdminSessions($limit: Int = 100, $offset: Int = 0) {
    adminSessions(limit: $limit, offset: $offset) {
      nodes {
        ...SessionAdminFields
      }
      totalCount
      hasNextPage
    }
  }
  ${SESSION_ADMIN_FIELDS}
`;

export const GET_SESSION = gql`
  query GetSession($id: ID!) {
    session(id: $id) {
      ...SessionFields
    }
  }
  ${SESSION_FIELDS}
`;

export const GET_SESSION_BY_SLUG = gql`
  query GetSessionBySlug($slug: String!) {
    sessionBySlug(slug: $slug) {
      ...SessionFields
    }
  }
  ${SESSION_FIELDS}
`;