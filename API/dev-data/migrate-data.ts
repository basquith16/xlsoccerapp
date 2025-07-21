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
        acc[key] = valueParts.join('='); // Rejoin in case value contains '='
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

// Export current data
const exportData = async () => {
  console.log('📤 Exporting current data...');
  
  const data = {
    users: [],
    players: [],
    sessions: [],
    bookings: []
  };

  try {
    // Export users with password field included
    const users = await User.find({}).select('+password').lean();
    data.users = users.map(user => ({
      ...user,
      _id: user._id.toString()
    }));
    console.log(`📤 Exported ${users.length} users`);

    // Export sessions
    const sessions = await Session.find({}).lean();
    data.sessions = sessions.map(session => ({
      ...session,
      _id: session._id.toString(),
      trainers: session.trainers?.map(t => t.toString()) || []
    }));
    console.log(`📤 Exported ${sessions.length} sessions`);

    // Export bookings
    const bookings = await Booking.find({}).lean();
    data.bookings = bookings.map(booking => ({
      ...booking,
      _id: booking._id.toString(),
      session: booking.session?.toString(),
      user: booking.user?.toString(),
      player: booking.player?.toString()
    }));
    console.log(`📤 Exported ${bookings.length} bookings`);

    // Save to file
    const exportPath = path.join(process.cwd(), 'dev-data', 'exported-data.json');
    await fs.writeFile(exportPath, JSON.stringify(data, null, 2));
    console.log(`💾 Data exported to ${exportPath}`);

    return data;
  } catch (error) {
    console.error('❌ Export error:', error);
    throw error;
  }
};

// Clear database
const clearDatabase = async () => {
  console.log('🗑️ Clearing database...');
  
  try {
    await User.deleteMany({});
    await Player.deleteMany({});
    await Session.deleteMany({});
    await Booking.deleteMany({});
    console.log('✅ Database cleared');
  } catch (error) {
    console.error('❌ Clear database error:', error);
    throw error;
  }
};

// Create players for users
const createPlayersForUsers = async (users: any[]) => {
  console.log('👥 Creating players for users...');
  
  const players = [];
  
  for (const user of users) {
    // Create a player for each user (representing themselves)
    const player = new Player({
      name: user.name,
      birthDate: user.birthday || new Date('1990-01-01'), // Default if no birthday
      sex: 'male', // Default, can be updated later
      waiverSigned: user.waiverSigned || false,
      isMinor: false, // Adults are not minors
      profImg: user.photo || 'default.jpg',
      parent: user._id
    });
    
    await player.save();
    players.push(player);
    console.log(`👤 Created player for user: ${user.name}`);
  }
  
  return players;
};

// Re-import data with proper structure
const reimportData = async (data: any) => {
  console.log('📥 Re-importing data with proper structure...');
  
  try {
    // Re-import users
    const users = [];
    for (const userData of data.users) {
      const user = new User({
        ...userData,
        _id: userData._id
      });
      await user.save();
      users.push(user);
    }
    console.log(`✅ Re-imported ${users.length} users`);

    // Create players for users
    const players = await createPlayersForUsers(users);
    console.log(`✅ Created ${players.length} players`);

    // Re-import sessions
    const sessions = [];
    for (const sessionData of data.sessions) {
      const session = new Session({
        ...sessionData,
        _id: sessionData._id
      });
      await session.save();
      sessions.push(session);
    }
    console.log(`✅ Re-imported ${sessions.length} sessions`);

    // Re-import bookings with proper player references
    const bookings = [];
    for (const bookingData of data.bookings) {
      // Find the user for this booking
      const user = users.find(u => u._id.toString() === bookingData.user);
      if (!user) {
        console.log(`⚠️ Skipping booking - user not found: ${bookingData.user}`);
        continue;
      }

      // Find or create a player for this user
      let player = players.find(p => p.parent.toString() === user._id.toString());
      if (!player) {
        // Create a default player for this user
        player = new Player({
          name: user.name,
          birthDate: new Date('1990-01-01'),
          sex: 'male',
          waiverSigned: false,
          isMinor: false,
          profImg: 'default.jpg',
          parent: user._id
        });
        await player.save();
        players.push(player);
      }

      // Create booking with proper player reference
      const booking = new Booking({
        session: bookingData.session,
        user: bookingData.user,
        player: player._id, // Now properly linked to a player
        price: bookingData.price,
        createdAt: bookingData.createdAt,
        paid: bookingData.paid
      });
      
      await booking.save();
      bookings.push(booking);
    }
    console.log(`✅ Re-imported ${bookings.length} bookings with proper player references`);

    return { users, players, sessions, bookings };
  } catch (error) {
    console.error('❌ Re-import error:', error);
    throw error;
  }
};

// Main migration function
const migrateData = async () => {
  try {
    await connectDB();
    
    // Step 1: Export current data
    const data = await exportData();
    
    // Step 2: Clear database
    await clearDatabase();
    
    // Step 3: Re-import with proper structure
    await reimportData(data);
    
    console.log('🎉 Migration completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Users: ${data.users.length}`);
    console.log(`   - Sessions: ${data.sessions.length}`);
    console.log(`   - Bookings: ${data.bookings.length}`);
    console.log('   - Players: Created for each user');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateData();
}

export default migrateData; 