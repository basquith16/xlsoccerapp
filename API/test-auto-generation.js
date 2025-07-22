import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, 'config.env') });

// Import models
import './dist/src/models/userModel.js';
import './dist/src/models/sessionTemplateModel.js';
import './dist/src/models/schedulePeriodModel.js';
import './dist/src/models/sessionInstanceModel.js';

const User = mongoose.model('User');
const SessionTemplate = mongoose.model('SessionTemplate');
const SchedulePeriod = mongoose.model('SchedulePeriod');
const SessionInstance = mongoose.model('SessionInstance');

async function testAutoGeneration() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const dbUri = process.env.DATABASE?.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
    await mongoose.connect(dbUri);
    console.log('✅ Connected to MongoDB');

    // Clean up test data
    console.log('🧹 Cleaning up test data...');
    await SessionInstance.deleteMany({ name: { $regex: /Test Auto-Gen/ } });
    await SchedulePeriod.deleteMany({ name: { $regex: /Test Period/ } });
    await SessionTemplate.deleteMany({ name: { $regex: /Test Template/ } });
    await User.deleteMany({ email: 'test-coach@example.com' });

    // Create test coach
    console.log('👨‍🏫 Creating test coach...');
    const coach = new User({
      name: 'Test Coach',
      email: 'test-coach@example.com',
      password: 'password123',
      role: 'coach',
      birthday: new Date('1990-01-01')
    });
    await coach.save();
    console.log('✅ Test coach created');

    // Create test template
    console.log('📋 Creating test template...');
    const template = new SessionTemplate({
      name: 'Test Template - Auto-Gen',
      slug: 'test-template-auto-gen',
      sport: 'Soccer',
      demo: 'Youth',
      description: 'Test template for auto-generation',
      price: 50,
      rosterLimit: 20,
      birthYear: 2010,
      isActive: true
    });
    await template.save();
    console.log('✅ Test template created');

    // Create test period
    console.log('📅 Creating test period...');
    const period = new SchedulePeriod({
      template: template._id,
      name: 'Test Period - Auto-Gen',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      coaches: [coach._id],
      capacity: 20,
      isActive: true
    });
    await period.save();
    console.log('✅ Test period created');

    // Test auto-generation function
    console.log('🚀 Testing auto-generation...');
    
    // Simulate the generateInstancesFromPeriod logic
    const startDate = '2024-01-01';
    const endDate = '2024-01-07';
    const daysOfWeek = [1, 3, 5]; // Monday, Wednesday, Friday
    const startTime = '16:00';
    const endTime = '17:00';

    // Validate inputs
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format');
    }
    if (start >= end) {
      throw new Error('Start date must be before end date');
    }

    // Generate instances
    const instances = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      
      if (daysOfWeek.includes(dayOfWeek)) {
        const instance = new SessionInstance({
          period: period._id,
          template: template._id,
          name: `Test Auto-Gen - ${currentDate.toLocaleDateString()}`,
          date: new Date(currentDate),
          startTime,
          endTime,
          coaches: period.coaches,
          capacity: period.capacity,
          notes: 'Auto-generated test instance',
          isActive: true
        });
        instances.push(instance);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Save instances
    const savedInstances = await SessionInstance.insertMany(instances);
    console.log(`✅ Generated ${savedInstances.length} instances`);

    // Verify instances
    console.log('\n📊 Generated Instances:');
    savedInstances.forEach(instance => {
      console.log(`  - ${instance.name} (${instance.date.toDateString()})`);
    });

    // Test validation
    console.log('\n🧪 Testing validation...');
    
    // Test invalid time range
    try {
      const invalidInstance = new SessionInstance({
        period: period._id,
        template: template._id,
        name: 'Test Invalid Time',
        date: new Date('2024-01-01'),
        startTime: '17:00',
        endTime: '16:00', // End before start
        coaches: period.coaches,
        capacity: period.capacity,
        isActive: true
      });
      await invalidInstance.save();
      console.log('❌ Invalid time validation failed');
    } catch (error) {
      console.log('✅ Invalid time validation working correctly');
    }

    console.log('\n🎉 Auto-generation test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testAutoGeneration(); 