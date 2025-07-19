import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
// Rate limiting configuration
export const createRateLimiters = () => {
    // General API rate limiter
    const generalLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        message: {
            error: 'Too many requests from this IP, please try again later.',
            retryAfter: '15 minutes'
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            res.status(429).json({
                error: 'Too many requests from this IP, please try again later.',
                retryAfter: '15 minutes'
            });
        }
    });
    // Stricter limiter for authentication endpoints
    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // Limit each IP to 5 auth requests per windowMs
        message: {
            error: 'Too many authentication attempts, please try again later.',
            retryAfter: '15 minutes'
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            res.status(429).json({
                error: 'Too many authentication attempts, please try again later.',
                retryAfter: '15 minutes'
            });
        }
    });
    // GraphQL specific limiter
    const graphQLLimiter = rateLimit({
        windowMs: 1 * 60 * 1000, // 1 minute
        max: 50, // Limit each IP to 50 GraphQL requests per minute
        message: {
            error: 'Too many GraphQL requests, please try again later.',
            retryAfter: '1 minute'
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            res.status(429).json({
                error: 'Too many GraphQL requests, please try again later.',
                retryAfter: '1 minute'
            });
        }
    });
    return {
        generalLimiter,
        authLimiter,
        graphQLLimiter
    };
};
// CORS configuration
export const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL || 'http://localhost:3000']
        : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400 // 24 hours
};
// Helmet configuration for security headers
export const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
});
// Request size limiter middleware
export const requestSizeLimiter = (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (contentLength > maxSize) {
        return res.status(413).json({
            error: 'Request entity too large',
            message: 'Request body exceeds 10MB limit'
        });
    }
    next();
};
// GraphQL query depth limiter
export const queryDepthLimiter = (req, res, next) => {
    if (req.body && req.body.query) {
        const query = req.body.query;
        const depth = calculateQueryDepth(query);
        if (depth > 10) {
            return res.status(400).json({
                error: 'Query too complex',
                message: 'Query depth exceeds maximum limit of 10'
            });
        }
    }
    next();
};
// Calculate GraphQL query depth
const calculateQueryDepth = (query) => {
    let maxDepth = 0;
    let currentDepth = 0;
    for (const char of query) {
        if (char === '{') {
            currentDepth++;
            maxDepth = Math.max(maxDepth, currentDepth);
        }
        else if (char === '}') {
            currentDepth--;
        }
    }
    return maxDepth;
};
// Security middleware stack
export const securityMiddleware = [
    helmetConfig,
    cors(corsOptions),
    mongoSanitize(),
    hpp(),
    requestSizeLimiter,
    queryDepthLimiter
];
