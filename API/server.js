const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});

process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.log('Uncaught Exception - Shutting down application ...');
    process.exit(1);
    // TODO - restart app, do not leave hanging
});


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

// Server    
const app = require('./app');
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('Unhandled Rejection - Shutting down application ...');
    server.close(() => {
        process.exit(1);
    });
    // TODO - restart app, do not leave hanging
});