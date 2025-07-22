import { useQuery, useMutation } from '@apollo/client';
import {
  GET_SESSION_TEMPLATES,
  GET_ADMIN_SESSION_TEMPLATES,
  GET_SESSION_TEMPLATE,
  GET_SESSION_TEMPLATE_BY_SLUG,
  GET_SCHEDULE_PERIODS,
  GET_ADMIN_SCHEDULE_PERIODS,
  GET_SCHEDULE_PERIOD,
  GET_SCHEDULE_PERIODS_BY_TEMPLATE,
  GET_SESSION_INSTANCES,
  GET_ADMIN_SESSION_INSTANCES,
  GET_SESSION_INSTANCE,
  GET_SESSION_INSTANCES_BY_PERIOD,
  GET_SESSION_INSTANCES_BY_TEMPLATE,
  GET_ADMIN_COACHES
} from '../../graphql/queries';
import {
  CREATE_SESSION_TEMPLATE,
  UPDATE_SESSION_TEMPLATE,
  DELETE_SESSION_TEMPLATE,
  CREATE_SCHEDULE_PERIOD,
  UPDATE_SCHEDULE_PERIOD,
  DELETE_SCHEDULE_PERIOD,
  CREATE_SESSION_INSTANCE,
  UPDATE_SESSION_INSTANCE,
  DELETE_SESSION_INSTANCE,
  GENERATE_INSTANCES_FROM_PERIOD
} from '../../graphql/mutations';

// Template Hooks
export const useSessionTemplates = (limit?: number, offset?: number) => {
  return useQuery(GET_SESSION_TEMPLATES, {
    variables: { limit, offset },
    errorPolicy: 'all',
  });
};

export const useAdminSessionTemplates = (limit?: number, offset?: number) => {
  return useQuery(GET_ADMIN_SESSION_TEMPLATES, {
    variables: { limit, offset },
    errorPolicy: 'all',
  });
};

export const useSessionTemplate = (id: string) => {
  return useQuery(GET_SESSION_TEMPLATE, {
    variables: { id },
    errorPolicy: 'all',
  });
};

export const useSessionTemplateBySlug = (slug: string) => {
  return useQuery(GET_SESSION_TEMPLATE_BY_SLUG, {
    variables: { slug },
    errorPolicy: 'all',
  });
};

export const useCreateSessionTemplate = () => {
  return useMutation(CREATE_SESSION_TEMPLATE, {
    refetchQueries: [
      { query: GET_ADMIN_SESSION_TEMPLATES },
      { query: GET_SESSION_TEMPLATES }
    ]
  });
};

export const useUpdateSessionTemplate = () => {
  return useMutation(UPDATE_SESSION_TEMPLATE, {
    refetchQueries: [
      { query: GET_ADMIN_SESSION_TEMPLATES },
      { query: GET_SESSION_TEMPLATES }
    ]
  });
};

export const useDeleteSessionTemplate = () => {
  return useMutation(DELETE_SESSION_TEMPLATE, {
    refetchQueries: [
      { query: GET_ADMIN_SESSION_TEMPLATES },
      { query: GET_SESSION_TEMPLATES }
    ]
  });
};

// Period Hooks
export const useSchedulePeriods = (limit = 10, offset = 0) => {
  return useQuery(GET_SCHEDULE_PERIODS, {
    variables: { limit, offset },
    errorPolicy: 'all',
  });
};

export const useAdminSchedulePeriods = (limit = 10, offset = 0) => {
  return useQuery(GET_ADMIN_SCHEDULE_PERIODS, {
    variables: { limit, offset },
    errorPolicy: 'all',
  });
};

export const useSchedulePeriod = (id: string) => {
  return useQuery(GET_SCHEDULE_PERIOD, {
    variables: { id },
    errorPolicy: 'all',
  });
};

export const useSchedulePeriodsByTemplate = (templateId: string, limit = 10, offset = 0) => {
  return useQuery(GET_SCHEDULE_PERIODS_BY_TEMPLATE, {
    variables: { templateId, limit, offset },
    errorPolicy: 'all',
  });
};

export const useCreateSchedulePeriod = () => {
  return useMutation(CREATE_SCHEDULE_PERIOD, {
    refetchQueries: [
      { query: GET_ADMIN_SCHEDULE_PERIODS },
      { query: GET_SCHEDULE_PERIODS }
    ]
  });
};

export const useUpdateSchedulePeriod = () => {
  return useMutation(UPDATE_SCHEDULE_PERIOD, {
    refetchQueries: [
      { query: GET_ADMIN_SCHEDULE_PERIODS },
      { query: GET_SCHEDULE_PERIODS }
    ]
  });
};

export const useDeleteSchedulePeriod = () => {
  return useMutation(DELETE_SCHEDULE_PERIOD, {
    refetchQueries: [
      { query: GET_ADMIN_SCHEDULE_PERIODS },
      { query: GET_SCHEDULE_PERIODS }
    ]
  });
};

// Instance Hooks
export const useSessionInstances = (limit = 10, offset = 0) => {
  return useQuery(GET_SESSION_INSTANCES, {
    variables: { limit, offset },
    errorPolicy: 'all',
  });
};

export const useAdminSessionInstances = (limit = 10, offset = 0) => {
  return useQuery(GET_ADMIN_SESSION_INSTANCES, {
    variables: { limit, offset },
    errorPolicy: 'all',
  });
};

export const useSessionInstance = (id: string) => {
  return useQuery(GET_SESSION_INSTANCE, {
    variables: { id },
    errorPolicy: 'all',
  });
};

export const useSessionInstancesByPeriod = (periodId: string, limit = 10, offset = 0) => {
  return useQuery(GET_SESSION_INSTANCES_BY_PERIOD, {
    variables: { periodId, limit, offset },
    errorPolicy: 'all',
  });
};

export const useSessionInstancesByTemplate = (templateId: string, limit = 10, offset = 0) => {
  return useQuery(GET_SESSION_INSTANCES_BY_TEMPLATE, {
    variables: { templateId, limit, offset },
    errorPolicy: 'all',
  });
};

export const useCreateSessionInstance = () => {
  return useMutation(CREATE_SESSION_INSTANCE, {
    refetchQueries: [
      { query: GET_ADMIN_SESSION_INSTANCES },
      { query: GET_SESSION_INSTANCES }
    ]
  });
};

export const useUpdateSessionInstance = () => {
  return useMutation(UPDATE_SESSION_INSTANCE, {
    refetchQueries: [
      { query: GET_ADMIN_SESSION_INSTANCES },
      { query: GET_SESSION_INSTANCES }
    ]
  });
};

export const useDeleteSessionInstance = () => {
  return useMutation(DELETE_SESSION_INSTANCE, {
    refetchQueries: [
      { query: GET_ADMIN_SESSION_INSTANCES },
      { query: GET_SESSION_INSTANCES }
    ]
  });
};

export const useAdminCoaches = () => {
  return useQuery(GET_ADMIN_COACHES, {
    errorPolicy: 'all',
  });
};

export const useGenerateInstancesFromPeriod = () => {
  return useMutation(GENERATE_INSTANCES_FROM_PERIOD, {
    refetchQueries: [
      { query: GET_ADMIN_SESSION_INSTANCES },
      { query: GET_SESSION_INSTANCES }
    ]
  });
}; 