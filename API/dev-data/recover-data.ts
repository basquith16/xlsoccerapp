import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import User from '../src/models/userModel.ts';
import Player from '../src/models/playerModel.ts';
import Session from '../src/models/sessionModel.ts';
import Booking from '../src/models/bookingModel.ts';
import bcrypt from 'bcryptjs';

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

// Create demo users
const createDemoUsers = async () => {
  console.log('👥 Creating demo users...');
  
  const demoUsers = [
    {
      name: 'Brian Asquith',
      email: 'brian@xlsoccerworld.com',
      role: 'admin',
      password: 'password123',
      photo: 'default.jpg',
      waiverSigned: true
    },
    {
      name: 'Marcela Asquith',
      email: 'marcela@test.com',
      role: 'user',
      password: 'password123',
      photo: 'default.jpg',
      waiverSigned: true
    },
    {
      name: 'John Riley',
      email: 'john@example.com',
      role: 'user',
      password: 'password123',
      photo: 'user-19.jpg',
      waiverSigned: false
    },
    {
      name: 'Claude Davis',
      email: 'claude@xlsoccerworld.com',
      role: 'coach',
      password: 'password123',
      photo: 'default',
      waiverSigned: true
    },
    {
      name: 'Gary Teale',
      email: 'gary@xlsoccer.com',
      role: 'coach',
      password: 'password123',
      photo: 'default.jpg',
      waiverSigned: true
    }
  ];

  const users = [];
  for (const userData of demoUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const user = new User({
      ...userData,
      password: hashedPassword,
      passwordChangedAt: new Date(),
      joinedDate: new Date(),
      active: true,
      assignedSessions: [],
      fees: []
    });
    
    await user.save();
    users.push(user);
    console.log(`👤 Created user: ${user.name} (${user.role})`);
  }
  
  return users;
};

// Create players for users
const createPlayersForUsers = async (users: any[]) => {
  console.log('👥 Creating players for users...');
  
  const players = [];
  
  for (const user of users) {
    // Create a player for each user (representing themselves)
    const player = new Player({
      name: user.name,
      birthDate: new Date('1990-01-01'), // Default birthday
      sex: 'male', // Default, can be updated later
      waiverSigned: user.waiverSigned,
      isMinor: false, // Adults are not minors
      profImg: user.photo,
      parent: user._id
    });
    
    await player.save();
    players.push(player);
    console.log(`👤 Created player for user: ${user.name}`);
  }
  
  return players;
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
const createDemoBookings = async (users: any[], players: any[], sessions: any[]) => {
  console.log('📅 Creating demo bookings...');
  
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

// Main recovery function
const recoverData = async () => {
  try {
    await connectDB();
    
    console.log('🔄 Starting data recovery...');
    
    // Step 1: Create demo users
    const users = await createDemoUsers();
    
    // Step 2: Create players for users
    const players = await createPlayersForUsers(users);
    
    // Step 3: Import sessions
    const sessions = await importSessions();
    
    // Step 4: Create demo bookings
    const bookings = await createDemoBookings(users, players, sessions);
    
    console.log('🎉 Data recovery completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Players: ${players.length}`);
    console.log(`   - Sessions: ${sessions.length}`);
    console.log(`   - Bookings: ${bookings.length}`);
    console.log('\n🔑 Demo Login Credentials:');
    console.log('   Email: brian@xlsoccerworld.com');
    console.log('   Password: password123');
    
  } catch (error) {
    console.error('❌ Recovery failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run recovery if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  recoverData();
}

export default recoverData; 