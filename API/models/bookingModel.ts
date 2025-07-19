import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interfaces
export interface IBooking extends Document {
  session: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  price: number;
  createdAt: Date;
  paid: boolean;
}

// Mongoose Schema
const bookingSchema = new Schema({
  session: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  paid: {
    type: Boolean,
    default: false
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Create and export model
const Booking = mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking; 