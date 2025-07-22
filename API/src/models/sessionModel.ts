import mongoose, { Document, Schema } from 'mongoose';
import slugify from 'slugify';
import validator from 'validator';
import User from './userModel.js';

// TypeScript interfaces
export interface ISession extends Document {
  sport: 'soccer' | 'basketball' | 'volleyball' | 'camp' | 'futsal' | 'football';
  demo: 'boys' | 'girls' | 'coed';
  name: string;
  image: any[];
  price: number;
  priceDiscount?: number;
  startDates: Date[];
  endDate: Date;
  birthYear: number;
  ageRange?: {
    minAge: number;
    maxAge: number;
  };
  timeStart: string;
  timeEnd: string;
  trainers: any[];
  rosterLimit: number;
  slug: string;
  staffOnly: boolean;
  active: boolean;
  description?: string;
  duration?: string;
  profileImages: string[];
}

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
      validator: function(this: any, val: number) {
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
  ageRange: {
    minAge: {
      type: Number,
      required: false,
      min: 0,
      max: 100
    },
    maxAge: {
      type: Number,
      required: false,
      min: 0,
      max: 100,
      validate: {
        validator: function(this: any, val: number) {
          if (!this.minAge) return true; // Allow if minAge not set
          return val >= this.minAge;
        },
        message: 'Max age must be greater than or equal to min age'
      }
    }
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
  active: {
    type: Boolean,
    default: true
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
  transform: function(this: any, count: number) {
    return Math.max(0, this.rosterLimit - count);
  }
});

// Document Middleware
sessionSchema.pre('save', function(this: any, next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Embedding coaches as part of sessions 
sessionSchema.pre('save', async function(this: any, next) {
  const coachesPromises = this.trainers.map(async (id: string) => await User.findById(id));
  this.trainers = await Promise.all(coachesPromises);
  next();
});

// Query Middleware
sessionSchema.pre(/^find/, function(this: any, next) {
  this.find({ staffOnly: { $ne: true } });
  this.start = Date.now();
  next();
});

// Aggregation Middleware
sessionSchema.pre('aggregate', function(this: any, next) {
  this.pipeline().unshift({ $match: { staffOnly: { $ne: true } } });
  next();
});

// Create and export model
const Session = mongoose.model<ISession>('Session', sessionSchema);

export default Session; 