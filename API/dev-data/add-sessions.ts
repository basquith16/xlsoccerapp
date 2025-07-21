import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import User from '../src/models/userModel.ts';
import Player from '../src/models/playerModel.ts';
import Session from '../src/models/sessionModel.ts';
import Booking from '../src/models/bookingModel.ts';

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Load environment variables from config.env
    const configPath = path.join(process.cwd(), 'config.env');
    const configContent = await fs.readFile(configPath, 'utf8');
    const envVars = configContent.split('\n').reduce((acc, line) => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        acc[key] = valueParts.join('=');
      }
      return acc;
    }, {} as Record<string, string>);

    const mongoUri = envVars.DATABASE || process.env.MONGODB_URI || 'mongodb://localhost:27017/nasessions';
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Import sessions from JSON file
const importSessions = async () => {
  console.log('📥 Importing sessions...');
  
  try {
    const sessionsPath = path.join(process.cwd(), 'dev-data', 'data', 'sessions-final.json');
    const sessionsData = await fs.readFile(sessionsPath, 'utf8');
    const sessions = JSON.parse(sessionsData);
    
    const importedSessions = [];
    for (const sessionData of sessions) {
      // Convert date strings to Date objects
      const startDates = sessionData.startDates.map((dateStr: string) => new Date(dateStr));
      const endDate = new Date(sessionData.endDate[0]); // Use first end date
      
      const session = new Session({
        ...sessionData,
        _id: new mongoose.Types.ObjectId(),
        startDates: startDates,
        endDate: endDate,
        trainers: sessionData.trainers || []
      });
      
      await session.save();
      importedSessions.push(session);
    }
    
    console.log(`✅ Imported ${importedSessions.length} sessions`);
    return importedSessions;
  } catch (error) {
    console.error('❌ Session import error:', error);
    throw error;
  }
};

// Create some demo bookings
const createDemoBookings = async (sessions: any[]) => {
  console.log('📅 Creating demo bookings...');
  
  // Get existing users and players
  const users = await User.find({});
  const players = await Player.find({});
  
  if (users.length === 0 || players.length === 0) {
    console.log('⚠️ No users or players found. Skipping bookings.');
    return [];
  }
  
  const bookings = [];
  
  // Create a few sample bookings
  const sampleBookings = [
    {
      user: users[1], // Marcela
      player: players[1],
      session: sessions[0],
      price: 125,
      paid: true
    },
    {
      user: users[2], // John
      player: players[2],
      session: sessions[1],
      price: 100,
      paid: false
    },
    {
      user: users[0], // Brian
      player: players[0],
      session: sessions[2],
      price: 115,
      paid: true
    }
  ];
  
  for (const bookingData of sampleBookings) {
    const booking = new Booking({
      user: bookingData.user._id,
      player: bookingData.player._id,
      session: bookingData.session._id,
      price: bookingData.price,
      paid: bookingData.paid,
      createdAt: new Date()
    });
    
    await booking.save();
    bookings.push(booking);
    console.log(`📅 Created booking: ${bookingData.user.name} -> ${bookingData.session.name}`);
  }
  
  console.log(`✅ Created ${bookings.length} demo bookings`);
  return bookings;
};

// Main function
const addSessions = async () => {
  try {
    await connectDB();
    
    console.log('🔄 Adding sessions and bookings...');
    
    // Step 1: Import sessions
    const sessions = await importSessions();
    
    // Step 2: Create demo bookings
    const bookings = await createDemoBookings(sessions);
    
    console.log('🎉 Sessions and bookings added successfully!');
    console.log('📊 Summary:');
    console.log(`   - Sessions: ${sessions.length}`);
    console.log(`   - Bookings: ${bookings.length}`);
    
  } catch (error) {
    console.error('❌ Failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addSessions();
}

export default addSessions; 