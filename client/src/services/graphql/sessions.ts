import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import {
  GET_SESSIONS,
  GET_ADMIN_SESSIONS,
  GET_SESSION,
  GET_SESSION_BY_SLUG
} from '../../graphql/queries';
import {
  CREATE_SESSION,
  UPDATE_SESSION,
  DELETE_SESSION
} from '../../graphql/mutations';

// Session Hooks
export const useSessions = (limit?: number, offset?: number) => {
  return useQuery(GET_SESSIONS, {
    variables: { limit, offset },
    errorPolicy: 'all',
  });
};

export const useAdminSessions = (limit?: number, offset?: number) => {
  return useQuery(GET_ADMIN_SESSIONS, {
    variables: { limit, offset },
    errorPolicy: 'all',
  });
};

export const useSession = (id: string) => {
  return useQuery(GET_SESSION, {
    variables: { id },
    errorPolicy: 'all',
  });
};

export const useSessionBySlug = (slug: string) => {
  return useQuery(GET_SESSION_BY_SLUG, {
    variables: { slug },
    errorPolicy: 'all',
  });
};

export const useLazySession = () => {
  return useLazyQuery(GET_SESSION, {
    errorPolicy: 'all',
  });
};

// Session Mutations
export const useCreateSession = () => {
  return useMutation(CREATE_SESSION, {
    refetchQueries: [
      { query: GET_ADMIN_SESSIONS },
      { query: GET_SESSIONS }
    ]
  });
};

export const useUpdateSession = () => {
  return useMutation(UPDATE_SESSION, {
    refetchQueries: [
      { query: GET_ADMIN_SESSIONS },
      { query: GET_SESSIONS }
    ]
  });
};

export const useDeleteSession = () => {
  return useMutation(DELETE_SESSION, {
    refetchQueries: [
      { query: GET_ADMIN_SESSIONS },
      { query: GET_SESSIONS }
    ]
  });
}; 