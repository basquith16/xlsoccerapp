import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Import routes
import userRoutes from '../routes/userRoutes.js';
import sessionRoutes from '../routes/sessionRoutes.js';
import bookingRoutes from '../routes/bookingRoutes.js';
import reviewRoutes from '../routes/reviewRoutes.js';
import playerRoutes from '../routes/playerRoutes.js';
// Import error handling
import AppError from '../utils/appError.js';
import globalErrorHandler from '../controllers/errorController.js';
const app = express();
// Security middleware
app.use(helmet());
// Rate limiting
const limiter = rateLimit({
    max: 100, // limit each IP to 100 requests per windowMs
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);
// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization against XSS - removed for now
// Prevent parameter pollution
app.use(hpp());
// CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.com']
        : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));
// Compression
app.use(compression());
// Static files
app.use(express.static(path.join(__dirname, '../public')));
// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/players', playerRoutes);
// Handle unhandled routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
// Error handling middleware
app.use(globalErrorHandler);
export default app;
