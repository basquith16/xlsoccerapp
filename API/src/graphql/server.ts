import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema.js';
import jwt from 'jsonwebtoken';
import User from '../../models/userModel';
import { resolvers } from './resolvers/index.js';
import { isRateLimited, getClientIP } from '../middleware/rateLimiter.js';

export const createApolloServer = () => {
  return new ApolloServer({
    typeDefs,
    resolvers,
    introspection: process.env.NODE_ENV !== 'production', // Disable introspection in production
    formatError: (error) => {
      // Log errors for debugging
      console.error('GraphQL Error:', error);
      
      // Return sanitized error to client
      return {
        message: error.message,
        code: error.extensions?.code || 'INTERNAL_SERVER_ERROR'
      };
    }
  });
};

// Query depth and complexity analysis
const getQueryDepth = (document: any): number => {
  let maxDepth = 0;
  
  const traverse = (node: any, depth: number = 0) => {
    if (depth > maxDepth) {
      maxDepth = depth;
    }
    
    if (node.selectionSet) {
      node.selectionSet.selections.forEach((selection: any) => {
        traverse(selection, depth + 1);
      });
    }
  };
  
  document.definitions.forEach((def: any) => {
    if (def.selectionSet) {
      def.selectionSet.selections.forEach((selection: any) => {
        traverse(selection, 1);
      });
    }
  });
  
  return maxDepth;
};

const getQueryComplexity = (document: any): number => {
  let complexity = 0;
  
  const traverse = (node: any) => {
    if (node.kind === 'Field') {
      complexity++;
    }
    
    if (node.selectionSet) {
      node.selectionSet.selections.forEach((selection: any) => {
        traverse(selection);
      });
    }
  };
  
  document.definitions.forEach((def: any) => {
    if (def.selectionSet) {
      def.selectionSet.selections.forEach((selection: any) => {
        traverse(selection);
      });
    }
  });
  
  return complexity;
};

export const startApolloServer = async (apolloServer: ApolloServer) => {
  const { url } = await startStandaloneServer(apolloServer, {
    listen: { port: 4000 },
    context: async ({ req }) => {
      // Request size validation
      const contentLength = parseInt(req.headers['content-length'] || '0');
      const maxSize = 1024 * 1024; // 1MB
      
      if (contentLength > maxSize) {
        throw new Error('Request too large. Maximum size is 1MB.');
      }

      // Simple rate limiting
      const ip = getClientIP(req);
      
      if (isRateLimited(ip)) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Get the user token from the headers
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return { user: null };
      }

      try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        // Get user from database
        const user = await User.findById(decoded.id);
        
        if (!user) {
          return { user: null };
        }

        return { user };
      } catch (error) {
        return { user: null };
      }
    }
  });

  return url;
}; 