const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');

// START Mongoose Schema
const sessionSchema = new mongoose.Schema({
    sport: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        enum: ['soccer', 'basketball', 'volleyball', 'camp', 'futsal', 'football'],
        select: false
    },
    demo: {
        type: String,
        required: true,
        enum: ['boys', 'girls', 'coed'],
        select: false
    },
    name:{
        type: String,
        required: true,
        unique: false,
        trim: true,
        maxlength: [50, 'Name must have less than 50 characters'],
        minlength: [10, 'Name must have more than 10 characters']
    },
    image: {
        type: Array
    },
    price: {
        type: Number,
        required: true
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val) {
                // 'this' will only work on creating NEW document, NOT updates
                return val < this.price; 
            },
            message: 'Discount ({VALUE}) needs to be lower than price'
        } 
    },
    startDates: {
        type: [Date],
        required: true
    },
    endDate: {
        type: [Date],
        required: true
    },
    birthYear: {
        type: Number,
        required: true,
        max: 2018,
    },
    timeStart: {
        type: String,
        required: true
    },
    timeEnd: {
        type: String,
        required: true
    },
    trainers: {
        type: Array,
    },
    rosterLimit: {
        type: Number,
        required: true,
    },
    slug: {
        type: String
    },
    staffOnly: {
        type: Boolean,
        default: false
    },
    description: String,
    duration: String,
    profileImages: {
        type: Array,
        default: [
            "boys2016",
            "elitecamp",
            "xlcamp"]
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

sessionSchema.index({birthYear: 1}); // increase query performance for often queried parameters

// Virtual Properties -- 
//   1. Can be derived from other properties and are not saved to DB
//   2. Cannot be queried!

// sessionSchema.virtual('sessionDuration').get(function() {
//     return (this.timeStart *1 )- ( this.timeEnd * 1);
// });
// END Virtual Properties Example

// Virtual Populate --> Creates roster from Player(s)
sessionSchema.virtual('roster', {
    ref: 'Player',
    foreignField: 'teams',
    localField: '_id',
});


// Mongoose Document Middleware: runs before .save() and .create() ONLY
// You can use multiple hooks of same type (ie .pre, .post)

// Document Middleware
sessionSchema.pre('save', function(next) {
    this.slug = slugify(this.name, {lower: true});
    next();
});

// Embedding coaches as part of sessions 
sessionSchema.pre('save', async function(next) {
    const coachesPromises = this.trainers.map(async id => await User.findById(id));

    this.trainers = await Promise.all(coachesPromises);
    next();
});


// Query Middleware
sessionSchema.pre(/^find/, function(next) {  // regular expression for every query that begins with 'find'
    this.find({ staffOnly: {$ne: true }});
    this.start = Date.now();
    next();
});

// sessionSchema.pre(/^find/, function(next) {
//     this.populate({
//         path: 'trainers',
//         select: '-role -passwordChangedAt -waiverSigned -players -joinedDate -fees -_id -__v'
//     }); 
//     next();
// })

// Aggregation Middleware
sessionSchema.pre('aggregate', function(next) {
    this.pipeline().unshift({ $match: { staffOnly: { $ne: true } } } );
    console.log(this.pipeline());
    next();
})


// START Convert Schema to Model
const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
