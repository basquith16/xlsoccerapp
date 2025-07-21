import crypto from 'crypto';
import mongoose, { Document, Schema, Model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

// TypeScript interfaces
export interface IUser extends Document {
  club?: string;
  name: string;
  email: string;
  assignedSessions: any[];
  photo: string;
  role: 'user' | 'coach' | 'admin';
  password: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  waiverSigned: boolean;
  joinedDate: Date;
  birthday?: Date;
  fees?: any[];
  active: boolean;
  correctPassword(candidatePassword: string, userPassword: string): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  createPasswordResetToken(): string;
}

// Mongoose Schema
const userSchema = new Schema({
  club: {
    type: String
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail]
  },
  assignedSessions: {
    type: Array,
    default: []
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'coach', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now()
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  waiverSigned: {
    type: Boolean,
    default: false
  },
  joinedDate: {
    type: Date,
    default: Date.now()
  },
  birthday: {
    type: Date
  },
  fees: {
    type: Array
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Pre-save middleware
userSchema.pre('save', async function(this: any, next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre('save', async function(this: any, next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

userSchema.pre(/^find/, function(this: any, next) {
  this.find({ active: { $ne: false } });
  next();
});

// Instance methods
userSchema.methods.correctPassword = async function(candidatePassword: string, userPassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp: number): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt((this.passwordChangedAt.getTime() / 1000).toString(), 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function(): string {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

// Create and export model
const User = mongoose.model<IUser>('User', userSchema);

// Virtual for family members (players)
userSchema.virtual('familyMembers', {
  ref: 'Player',
  localField: '_id',
  foreignField: 'parent'
});

export default User; 