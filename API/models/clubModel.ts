import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interfaces
export interface IClub extends Document {
  name: string;
  description?: string;
  location?: string;
  contactEmail?: string;
  contactPhone?: string;
}

// Mongoose Schema
const clubSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  location: {
    type: String
  },
  contactEmail: {
    type: String
  },
  contactPhone: {
    type: String
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Create and export model
const Club = mongoose.model<IClub>('Club', clubSchema);

export default Club; 