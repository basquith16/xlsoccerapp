import mongoose from 'mongoose';
import Session from '../../models/sessionModel.ts';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../config.env') });

console.log('Environment check:', {
  DATABASE: process.env.DATABASE ? 'Found' : 'Missing',
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD ? 'Found' : 'Missing'
});

// Get database URI from environment
const getDatabaseURI = () => {
  if (!process.env.DATABASE || !process.env.DATABASE_PASSWORD) {
    throw new Error('Missing required environment variables: DATABASE and DATABASE_PASSWORD');
  }
  
  const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
  );
  return DB;
};

// Connect to MongoDB
mongoose.connect(getDatabaseURI())
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Function to clean session names
const cleanSessionName = (name) => {
  // Remove ALL parentheses and their contents
  return name
    .replace(/\s*\([^)]*\)/g, '') // Remove any parentheses and their contents
    .trim();
};

// Update all sessions
const cleanSessionNames = async () => {
  try {
    console.log('Starting session name cleanup...');
    
    // Get all sessions
    const sessions = await Session.find({});
    console.log(`Found ${sessions.length} sessions to process`);
    
    let updatedCount = 0;
    const usedNames = new Set();
    
    for (const session of sessions) {
      const originalName = session.name;
      let cleanedName = cleanSessionName(originalName);
      
      // Handle duplicate names by adding a unique suffix
      let counter = 1;
      let finalName = cleanedName;
      while (usedNames.has(finalName)) {
        finalName = `${cleanedName} ${counter}`;
        counter++;
      }
      usedNames.add(finalName);
      
      // Only update if the name actually changed
      if (originalName !== finalName) {
        session.name = finalName;
        await session.save({ validateBeforeSave: false });
        console.log(`Updated: "${originalName}" → "${finalName}"`);
        updatedCount++;
      }
    }
    
    console.log(`\n✅ Cleanup complete! Updated ${updatedCount} session names.`);
    
  } catch (error) {
    console.error('Error cleaning session names:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the cleanup
cleanSessionNames(); 