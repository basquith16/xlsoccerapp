import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';

dotenv.config({path: './config.env'});

process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.log('Uncaught Exception - Shutting down application ...');
    process.exit(1);
    // TODO - restart app, do not leave hanging
});

// Connect to database with mongoose
const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

try {
    await mongoose.connect(DB);
    console.log('DB connection successful');
} catch (error) {
    console.error('DB connection failed:', error);
    process.exit(1);
}

// Server    
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('Unhandled Rejection - Shutting down application ...');
    server.close(() => {
        process.exit(1);
    });
    // TODO - restart app, do not leave hanging
});