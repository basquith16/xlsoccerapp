const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const User = require('../../models/userModel');

// Connect to database with mongoose
const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);
mongoose.connect(DB, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(con => { console.log('DB connection successful'); })

// Read JSON file
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

// Import Data into DB
const importData = async () => {
    try {
        await User.create(users, { validateBeforeSave: false });
        console.log('Data was loaded');
        process.exit();
    } catch (err) {
        console.log(err)
    }
}

// Delete all Data from Collection
const deleteData = async () => {
    try {
        await Session.deleteMany();
        console.log('Data was deleted!');
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