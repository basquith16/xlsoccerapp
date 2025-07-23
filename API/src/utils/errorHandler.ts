import { GraphQLError } from 'graphql';

// Error codes for consistent error handling
export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_FIELDS = 'MISSING_FIELDS',
  
  // Business Logic
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',  
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  
  // Database
  DATABASE_ERROR = 'DATABASE_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  
  // External Services
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  PAYMENT_ERROR = 'PAYMENT_ERROR',
  EMAIL_ERROR = 'EMAIL_ERROR',
  
  // System
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // GraphQL
  QUERY_TOO_COMPLEX = 'QUERY_TOO_COMPLEX',
  QUERY_TOO_DEEP = 'QUERY_TOO_DEEP'
}

// Standard error response interface
export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  field?: string;
  details?: any;
}

// Create a standardized GraphQL error
export const createGraphQLError = (
  message: string,
  code: ErrorCode,
  field?: string,
  details?: any
): GraphQLError => {
  return new GraphQLError(message, {
    extensions: {
      code,
      field,
      details
    }
  });
};

// Error handler for authentication
export const handleAuthError = (message: string, field?: string) => {
  return createGraphQLError(message, ErrorCode.UNAUTHENTICATED, field);
};

// Error handler for authorization
export const handleForbiddenError = (message: string = 'Access denied') => {
  return createGraphQLError(message, ErrorCode.FORBIDDEN);
};

// Error handler for validation
export const handleValidationError = (message: string, field?: string, details?: any) => {
  return createGraphQLError(message, ErrorCode.VALIDATION_ERROR, field, details);
};

// Error handler for not found resources
export const handleNotFoundError = (resource: string, id?: string) => {
  const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
  return createGraphQLError(message, ErrorCode.RESOURCE_NOT_FOUND);
};

// Error handler for duplicate resources
export const handleDuplicateError = (resource: string, field?: string) => {
  const message = field 
    ? `${resource} with this ${field} already exists`
    : `${resource} already exists`;
  return createGraphQLError(message, ErrorCode.DUPLICATE_RESOURCE, field);
};

// Error handler for database errors
export const handleDatabaseError = (error: any, operation?: string) => {
  const message = operation 
    ? `Database error during ${operation}`
    : 'Database operation failed';
  
  // Log the actual error for debugging (only in development)
  if (process.env.NODE_ENV !== 'production') {
    console.error('Database Error:', error);
  }
  
  return createGraphQLError(message, ErrorCode.DATABASE_ERROR, undefined, {
    operation,
    originalError: process.env.NODE_ENV !== 'production' ? error.message : undefined
  });
};

// Error handler for external service errors
export const handleExternalServiceError = (service: string, error: any) => {
  const message = `${service} service error`;
  
  if (process.env.NODE_ENV !== 'production') {
    console.error(`${service} Error:`, error);
  }
  
  return createGraphQLError(message, ErrorCode.EXTERNAL_SERVICE_ERROR, undefined, {
    service,
    originalError: process.env.NODE_ENV !== 'production' ? error.message : undefined
  });
};

// Wrap async functions with error handling
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      // If it's already a GraphQLError, re-throw it
      if (error instanceof GraphQLError) {
        throw error;
      }
      
      // Handle known error types
      if (error instanceof Error) {
        if (error.name === 'ValidationError') {
          throw handleValidationError(error.message);
        }
        
        if (error.name === 'CastError' || error.name === 'MongoError') {
          throw handleDatabaseError(error, context);
        }
      }
      
      // Default to internal server error
      const message = context 
        ? `Internal error in ${context}`
        : 'Internal server error';
      
      if (process.env.NODE_ENV !== 'production') {
        console.error('Unhandled Error:', error);
      }
      
      throw createGraphQLError(message, ErrorCode.INTERNAL_SERVER_ERROR, undefined, {
        context,
        originalError: process.env.NODE_ENV !== 'production' ? String(error) : undefined
      });
    }
  };
};

// Format errors for client response
export const formatErrorForClient = (error: GraphQLError): ErrorResponse => {
  return {
    code: (error.extensions?.code as ErrorCode) || ErrorCode.INTERNAL_SERVER_ERROR,
    message: error.message,
    field: error.extensions?.field as string,
    details: error.extensions?.details
  };
};

// Check if error is operational (expected) vs programming error
export const isOperationalError = (error: any): boolean => {
  if (error instanceof GraphQLError) {
    const code = error.extensions?.code as ErrorCode;
    return [
      ErrorCode.UNAUTHENTICATED,
      ErrorCode.FORBIDDEN,
      ErrorCode.VALIDATION_ERROR,
      ErrorCode.INVALID_INPUT,
      ErrorCode.MISSING_FIELDS,
      ErrorCode.RESOURCE_NOT_FOUND,
      ErrorCode.DUPLICATE_RESOURCE,
      ErrorCode.RESOURCE_CONFLICT,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      ErrorCode.QUERY_TOO_COMPLEX,
      ErrorCode.QUERY_TOO_DEEP
    ].includes(code);
  }
  return false;
};