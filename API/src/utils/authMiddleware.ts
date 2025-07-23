import { AuthContext } from '../types/context';
import { GraphQLError } from 'graphql';

// Field-level authorization middleware
export const requireAuth = (next: any) => (parent: any, args: any, context: AuthContext, info: any) => {
  if (!context.user) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED' }
    });
  }
  return next(parent, args, context, info);
};

export const requireAdmin = (next: any) => (parent: any, args: any, context: AuthContext, info: any) => {
  if (!context.user) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED' }
    });
  }
  
  if (context.user.role !== 'admin') {
    throw new GraphQLError('Admin access required', {
      extensions: { code: 'FORBIDDEN' }
    });
  }
  
  return next(parent, args, context, info);
};

export const requireCoachOrAdmin = (next: any) => (parent: any, args: any, context: AuthContext, info: any) => {
  if (!context.user) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED' }
    });
  }
  
  if (!['admin', 'coach'].includes(context.user.role)) {
    throw new GraphQLError('Coach or Admin access required', {
      extensions: { code: 'FORBIDDEN' }
    });
  }
  
  return next(parent, args, context, info);
};

export const requireOwnershipOrAdmin = (next: any) => (parent: any, args: any, context: AuthContext, info: any) => {
  if (!context.user) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED' }
    });
  }
  
  // Admin can access anything
  if (context.user.role === 'admin') {
    return next(parent, args, context, info);
  }
  
  // Check if user owns the resource (parent should have userId or similar)
  const resourceUserId = parent.userId || parent.user || parent.parent;
  if (resourceUserId && resourceUserId.toString() === context.user._id.toString()) {
    return next(parent, args, context, info);
  }
  
  throw new GraphQLError('Access denied: You can only access your own resources', {
    extensions: { code: 'FORBIDDEN' }
  });
};

// Helper to protect sensitive fields
export const protectSensitiveField = (allowedRoles: string[] = ['admin']) => 
  (next: any) => (parent: any, args: any, context: AuthContext, info: any) => {
    if (!context.user) {
      return null; // Return null for unauthenticated users instead of throwing
    }
    
    if (!allowedRoles.includes(context.user.role)) {
      return null; // Return null for unauthorized users instead of throwing
    }
    
    return next(parent, args, context, info);
  };