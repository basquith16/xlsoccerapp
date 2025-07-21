import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interfaces
export interface IReview extends Document {
  review: string;
  rating: number;
  session: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
}

// Mongoose Schema
const reviewSchema = new Schema({
  review: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
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
  createdAt: {
    type: Date,
    default: Date.now()
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Create and export model
const Review = mongoose.model<IReview>('Review', reviewSchema);

export default Review; 