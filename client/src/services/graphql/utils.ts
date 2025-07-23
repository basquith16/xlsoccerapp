import { ApolloError } from '@apollo/client';

// Handle GraphQL mutation responses
export const handleMutationResponse = (response: any) => {
  if (!response) {
    return { success: false, error: 'No response received' };
  }

  if (response.status === 'success') {
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } else {
    return {
      success: false,
      error: response.message || 'Operation failed',
      errors: response.errors
    };
  }
};

// Handle GraphQL errors
export const handleGraphQLError = (error: ApolloError | Error | any): string => {
  if (!error) {
    return 'An unknown error occurred';
  }

  // Apollo Client error
  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    return error.graphQLErrors[0].message;
  }

  // Network error
  if (error.networkError) {
    return error.networkError.message || 'Network error occurred';
  }

  // Regular error
  if (error.message) {
    return error.message;
  }

  // Fallback
  return 'An unexpected error occurred';
}; 