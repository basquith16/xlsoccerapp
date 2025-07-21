import mongoose from 'mongoose';
import User from '../src/models/userModel';
import Player from '../src/models/playerModel';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xlsoccerapp';

async function createUserPlayers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      // Check if user already has a Player record
      const existingPlayer = await Player.findOne({ parent: user._id });
      
      if (existingPlayer) {
        console.log(`User ${user.name} already has a Player record, skipping`);
        skippedCount++;
        continue;
      }

      // Calculate age for isMinor field
      const birthDate = user.birthday || new Date(1990, 0, 1);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;

      // Create Player record for user
      const player = new Player({
        name: user.name,
        birthDate: birthDate,
        sex: 'male', // Default, can be updated later
        waiverSigned: user.waiverSigned,
        isMinor: actualAge < 18,
        profImg: user.photo || 'default.jpg',
        parent: user._id
      });

      await player.save();
      console.log(`Created Player record for user: ${user.name}`);
      createdCount++;
    }

    console.log(`\nMigration completed:`);
    console.log(`- Created ${createdCount} Player records`);
    console.log(`- Skipped ${skippedCount} users (already had Player records)`);

  } catch (error) {
    console.error('Error creating user players:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createUserPlayers(); 