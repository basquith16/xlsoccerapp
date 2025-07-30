import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import { resolvers } from './resolvers/index';
import { isRateLimited, getClientIP } from '../middleware/rateLimiter';
import { GraphQLError } from 'graphql';
import { createDataLoaders } from '../utils/dataLoaders';
console.log('🔄 Loading updated server.ts with correct schema import...');
export const createApolloServer = () => {
    return new ApolloServer({
        typeDefs,
        resolvers,
        introspection: process.env.NODE_ENV !== 'production', // Disable introspection in production
        plugins: [
            {
                // Query validation plugin
                async requestDidStart() {
                    return {
                        async didResolveOperation({ request, document }) {
                            // Check query depth
                            const depth = getQueryDepth(document);
                            const maxDepth = 10; // Maximum allowed depth
                            if (depth > maxDepth) {
                                throw new GraphQLError(`Query depth of ${depth} exceeds maximum allowed depth of ${maxDepth}`, { extensions: { code: 'QUERY_TOO_DEEP' } });
                            }
                            // Check query complexity
                            const complexity = getQueryComplexity(document);
                            const maxComplexity = 1000; // Maximum allowed complexity
                            if (complexity > maxComplexity) {
                                throw new GraphQLError(`Query complexity of ${complexity} exceeds maximum allowed complexity of ${maxComplexity}`, { extensions: { code: 'QUERY_TOO_COMPLEX' } });
                            }
                        }
                    };
                }
            }
        ],
        formatError: (error) => {
            // Log errors for debugging (only in development)
            if (process.env.NODE_ENV !== 'production') {
                console.error('GraphQL Error:', error);
            }
            // Return sanitized error to client
            return {
                message: error.message,
                code: error.extensions?.code || 'INTERNAL_SERVER_ERROR'
            };
        }
    });
};
// Query depth and complexity analysis
const getQueryDepth = (document) => {
    let maxDepth = 0;
    const traverse = (node, depth = 0) => {
        if (depth > maxDepth) {
            maxDepth = depth;
        }
        if (node.selectionSet) {
            node.selectionSet.selections.forEach((selection) => {
                traverse(selection, depth + 1);
            });
        }
    };
    document.definitions.forEach((def) => {
        if (def.selectionSet) {
            def.selectionSet.selections.forEach((selection) => {
                traverse(selection, 1);
            });
        }
    });
    return maxDepth;
};
const getQueryComplexity = (document) => {
    let complexity = 0;
    const traverse = (node) => {
        if (node.kind === 'Field') {
            complexity++;
        }
        if (node.selectionSet) {
            node.selectionSet.selections.forEach((selection) => {
                traverse(selection);
            });
        }
    };
    document.definitions.forEach((def) => {
        if (def.selectionSet) {
            def.selectionSet.selections.forEach((selection) => {
                traverse(selection);
            });
        }
    });
    return complexity;
};
export const startApolloServer = async (apolloServer) => {
    const { url } = await startStandaloneServer(apolloServer, {
        listen: { port: 4000 },
        context: async ({ req, res }) => {
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
            // Try to get token from httpOnly cookie first, then fallback to Authorization header
            let token = null;
            // Parse cookies from request headers
            const cookies = req.headers.cookie;
            if (cookies) {
                const cookieArray = cookies.split(';');
                for (const cookie of cookieArray) {
                    const [name, value] = cookie.trim().split('=');
                    if (name === 'jwt') {
                        token = value;
                        break;
                    }
                }
            }
            // Fallback to Authorization header for backward compatibility
            if (!token) {
                token = req.headers.authorization?.replace('Bearer ', '');
            }
            if (!token) {
                return { user: null, req, res, loaders: createDataLoaders() };
            }
            try {
                // Verify the token
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                // Get user from database
                const user = await User.findById(decoded.id);
                if (!user) {
                    return { user: null, req, res, loaders: createDataLoaders() };
                }
                return { user, req, res, loaders: createDataLoaders() };
            }
            catch (error) {
                return { user: null, req, res, loaders: createDataLoaders() };
            }
        }
    });
    return url;
};
