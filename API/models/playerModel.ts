import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interfaces
export interface IPlayer extends Document {
  name: string;
  birthDate: Date;
  sex: 'male' | 'female';
  waiverSigned: boolean;
  isMinor: boolean;
  profImg?: string;
  parent: mongoose.Types.ObjectId;
  familyId?: mongoose.Types.ObjectId;
}

// Mongoose Schema
const playerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  birthDate: {
    type: Date,
    required: true
  },
  sex: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  waiverSigned: {
    type: Boolean,
    default: false
  },
  isMinor: {
    type: Boolean,
    default: true
  },
  profImg: {
    type: String,
    default: 'default.jpg'
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  familyId: {
    type: Schema.Types.ObjectId,
    ref: 'Family'
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Create and export model
const Player = mongoose.model<IPlayer>('Player', playerSchema);

export default Player; 