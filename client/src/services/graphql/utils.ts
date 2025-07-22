export const handleGraphQLError = (error: any) => {
  if (error.graphQLErrors) {
    return error.graphQLErrors.map((err: any) => err.message).join(', ');
  }
  if (error.networkError) {
    return 'Network error occurred. Please check your connection.';
  }
  return error.message || 'An unexpected error occurred.';
};

export const handleMutationResponse = (data: any) => {
  if (data?.errors) {
    return {
      success: false,
      errors: data.errors,
    };
  }
  return {
    success: true,
    data: data,
  };
}; 