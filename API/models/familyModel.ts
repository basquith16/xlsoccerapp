import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interfaces
export interface IFamily extends Document {
  name: string;
  primaryContact: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema
const familySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  primaryContact: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: Schema.Types.ObjectId,
    refPath: 'memberModels'
  }],
  memberModels: [{
    type: String,
    required: true,
    enum: ['User', 'Player']
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for getting all family members with their types
familySchema.virtual('familyMembers', {
  refPath: 'memberModel',
  localField: 'members',
  foreignField: '_id'
});

// Create and export model
const Family = mongoose.model<IFamily>('Family', familySchema);

export default Family; 