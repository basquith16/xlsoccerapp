import crypto from 'crypto';
import mongoose, { Document, Schema } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  club?: string;
  name: string;
  email: string;
  password: string;
  passwordConfirm?: string;
  assignedSessions: Record<string, unknown>[];
  photo: string;
  role: 'user' | 'coach' | 'admin';
  waiverSigned: boolean;
  joinedDate: Date;
  active: boolean;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  players?: mongoose.Types.ObjectId;
  fees?: Record<string, unknown>[];
  correctPassword(candidatePassword: string, userPassword: string): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  createPasswordResetToken(): string;
}

const userSchema = new Schema<IUser>({
  club: {
    type: String
  },
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  assignedSessions: {
    type: Schema.Types.Mixed,
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
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    select: false,
    validate: {
      validator: function(this: any, el: string) {
        return el === this.password;
      },
      message: 'Passwords do not match!'
    }
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
  players: {
    type: Schema.Types.ObjectId,
    ref: 'Player'
  },
  joinedDate: {
    type: Date,
    default: Date.now()
  },
  fees: {
    type: Schema.Types.Mixed
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

userSchema.pre('save', async function(this: any, next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
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

userSchema.methods.correctPassword = async function(candidatePassword: string, userPassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp: number): boolean {
  if(this.passwordChangedAt) {
    const changedTimestamp = parseInt(String(this.passwordChangedAt.getTime() / 1000), 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
}

userSchema.methods.createPasswordResetToken = function(): string {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
}

const User = mongoose.model<IUser>('User', userSchema);

export default User; 