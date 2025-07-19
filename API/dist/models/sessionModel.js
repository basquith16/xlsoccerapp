import mongoose, { Schema } from 'mongoose';
import slugify from 'slugify';
import User from './userModel.js';
// Mongoose Schema
const sessionSchema = new Schema({
    sport: {
        type: String,
        required: true,
        trim: true,
        enum: ['soccer', 'basketball', 'volleyball', 'camp', 'futsal', 'football']
    },
    demo: {
        type: String,
        required: true,
        enum: ['boys', 'girls', 'coed']
    },
    name: {
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
            validator: function (val) {
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
        type: Date,
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
            "xlcamp"
        ]
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
sessionSchema.index({ birthYear: 1 });
// Virtual Populate
sessionSchema.virtual('roster', {
    ref: 'Player',
    foreignField: 'teams',
    localField: '_id',
});
// Virtual for available spots
sessionSchema.virtual('availableSpots', {
    ref: 'Booking',
    localField: '_id',
    foreignField: 'session',
    count: true,
    transform: function (count) {
        return Math.max(0, this.rosterLimit - count);
    }
});
// Document Middleware
sessionSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});
// Embedding coaches as part of sessions 
sessionSchema.pre('save', async function (next) {
    const coachesPromises = this.trainers.map(async (id) => await User.findById(id));
    this.trainers = await Promise.all(coachesPromises);
    next();
});
// Query Middleware
sessionSchema.pre(/^find/, function (next) {
    this.find({ staffOnly: { $ne: true } });
    this.start = Date.now();
    next();
});
// Aggregation Middleware
sessionSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { staffOnly: { $ne: true } } });
    next();
});
// Create and export model
const Session = mongoose.model('Session', sessionSchema);
export default Session;
