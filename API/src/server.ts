import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createApolloServer, startApolloServer } from './graphql/server.js';
import { validateEnvironment, getDatabaseURI } from './utils/environment.js';

dotenv.config({path: './config.env'});

const startServer = async () => {
  try {
    // Validate environment
    validateEnvironment();

    // Connect to MongoDB using existing format
    const DB = getDatabaseURI();
    
    await mongoose.connect(DB);
    console.log('✅ Connected to MongoDB');

    // Create and start Apollo Server
    const apolloServer = createApolloServer();
    const url = await startApolloServer(apolloServer as any);
    
    console.log(`🚀 Apollo Server ready at ${url}`);
    console.log('🔒 Security features enabled:');
    console.log('   - Rate limiting (100 req/15min)');
    console.log('   - Input validation & sanitization');
    console.log('   - JWT authentication');
    console.log('   - Request size limiting (1MB)');
    console.log('   - SQL injection protection');
    console.log('   - XSS protection');
    console.log('   - Error sanitization');
    
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer(); 