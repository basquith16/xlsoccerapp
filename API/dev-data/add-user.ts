import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import User from '../src/models/userModel.ts';
import Player from '../src/models/playerModel.ts';
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

// Add specific user
const addUser = async () => {
  try {
    await connectDB();
    
    console.log('👤 Adding user to database...');
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: 'basquithcpt@gmail.com' });
    if (existingUser) {
      console.log('⚠️ User already exists. Updating password...');
      
      // Update password
      const hashedPassword = await bcrypt.hash('Romeo0416', 12);
      existingUser.password = hashedPassword;
      existingUser.passwordChangedAt = new Date();
      await existingUser.save();
      
      console.log('✅ Password updated for existing user');
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash('Romeo0416', 12);
      const user = new User({
        name: 'Brian M Asquith',
        email: 'basquithcpt@gmail.com',
        password: hashedPassword,
        role: 'admin',
        photo: 'default.jpg',
        waiverSigned: true,
        passwordChangedAt: new Date(),
        joinedDate: new Date(),
        active: true,
        assignedSessions: [],
        fees: []
      });
      
      await user.save();
      console.log('✅ User created successfully');
      
      // Create a player for this user
      const player = new Player({
        name: 'Brian M Asquith',
        birthDate: new Date('1990-01-01'), // Default birthday
        sex: 'male',
        waiverSigned: true,
        isMinor: false,
        profImg: 'default.jpg',
        parent: user._id
      });
      
      await player.save();
      console.log('✅ Player created for user');
    }
    
    console.log('🎉 User setup completed!');
    console.log('📧 Email: basquithcpt@gmail.com');
    console.log('🔑 Password: Romeo0416');
    
  } catch (error) {
    console.error('❌ Failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addUser();
}

export default addUser; 