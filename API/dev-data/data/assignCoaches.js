import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import Session from '../../models/sessionModel.ts';
import User from '../../models/userModel.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({path: './config.env'});

// Connect to database with mongoose
const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);
mongoose.connect(DB).then(con => { console.log('DB connection successful'); })

// Function to randomly assign coaches to sessions
const assignCoachesToSessions = async () => {
    try {
        // Get all users who could be coaches (you can adjust this filter)
        const potentialCoaches = await User.find({ 
            role: { $in: ['admin', 'coach', 'trainer'] } 
        }).select('_id name');
        
        // If no specific coach roles, get all users
        let coaches = potentialCoaches;
        if (coaches.length === 0) {
            coaches = await User.find({}).select('_id name').limit(10);
        }
        
        console.log(`Found ${coaches.length} potential coaches:`, coaches.map(c => c.name));
        
        if (coaches.length === 0) {
            console.log('No coaches found in database. Please create some users first.');
            process.exit(1);
        }
        
        // Get all sessions
        const sessions = await Session.find({});
        console.log(`Found ${sessions.length} sessions to assign coaches to`);
        
        // Assign random coaches to each session
        for (const session of sessions) {
            // Randomly select 1-2 coaches for each session
            const numCoaches = Math.random() < 0.7 ? 1 : 2; // 70% chance of 1 coach, 30% chance of 2
            const selectedCoaches = [];
            
            // Shuffle coaches array and take first numCoaches
            const shuffledCoaches = [...coaches].sort(() => Math.random() - 0.5);
            
            for (let i = 0; i < numCoaches && i < shuffledCoaches.length; i++) {
                selectedCoaches.push(shuffledCoaches[i]._id);
            }
            
            // Update session with assigned coaches
            session.trainers = selectedCoaches;
            await session.save({ validateBeforeSave: false });
            
            console.log(`Assigned ${selectedCoaches.length} coach(es) to session: ${session.name}`);
        }
        
        console.log('✅ Successfully assigned coaches to all sessions!');
        process.exit(0);
        
    } catch (err) {
        console.error('Error assigning coaches:', err);
        process.exit(1);
    }
}

// Function to show current coach assignments
const showCoachAssignments = async () => {
    try {
        const sessions = await Session.find({}).populate('trainers', 'name');
        
        console.log('\n📋 Current Coach Assignments:');
        console.log('==============================');
        
        sessions.forEach(session => {
            const coachNames = session.trainers && session.trainers.length > 0 
                ? session.trainers.map(t => t.name || 'Unknown').join(', ')
                : 'No coach assigned';
            
            console.log(`${session.name}: ${coachNames}`);
        });
        
        process.exit(0);
        
    } catch (err) {
        console.error('Error showing assignments:', err);
        process.exit(1);
    }
}

// Handle command line arguments
if (process.argv[2] === '--assign') {
    assignCoachesToSessions();
} else if (process.argv[2] === '--show') {
    showCoachAssignments();
} else {
    console.log('Usage:');
    console.log('  node assignCoaches.js --assign  # Assign random coaches to sessions');
    console.log('  node assignCoaches.js --show    # Show current coach assignments');
} 