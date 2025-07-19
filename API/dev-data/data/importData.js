import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import Session from '../../models/sessionModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({path: './config.env'});

// Connect to database with mongoose
const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);
mongoose.connect(DB).then(con => { console.log('DB connection successful'); })

// Read JSON files
const sessions = JSON.parse(fs.readFileSync(`${__dirname}/sessions-final.json`, 'utf-8'));

// Import Data into DB
const importData = async () => {
    try {
        await Session.create(sessions, { validateBeforeSave: false });
        console.log('All 50 sessions data was loaded');
        process.exit();
    } catch (err) {
        console.log(err)
    }
}

// Delete all Data from Collection
const deleteData = async () => {
    try {
        await Session.deleteMany();
        console.log('Sessions data was deleted!');
        process.exit();
    } catch (err) {
        console.log(err)
    }
}

if(process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}

console.log(process.argv);