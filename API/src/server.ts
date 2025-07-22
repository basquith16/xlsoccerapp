import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createApolloServer, startApolloServer } from './graphql/server';

dotenv.config({path: './config.env'});

// Connect to database with mongoose
const DB = process.env.DATABASE!.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD!
);

try {
    await mongoose.connect(DB);
    console.log('DB connection successful');
} catch (error) {
    console.error('DB connection failed:', error);
    process.exit(1);
}

// Create and start Apollo Server
const apolloServer = createApolloServer();
const url = await startApolloServer(apolloServer as any);
console.log(`🚀 Apollo Server ready at ${url}`);

process.on('uncaughtException', (err: Error) => {
    console.log(err.name, err.message);
    console.log('Uncaught Exception - Shutting down application ...');
    process.exit(1);
});

process.on('unhandledRejection', (err: Error) => {
    console.log(err.name, err.message);
    console.log('Unhandled Rejection - Shutting down application ...');
    process.exit(1);
}); 