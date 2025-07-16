import crypto from 'crypto';
import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

// START Mongoose Schema
const userSchema = new mongoose.Schema({
    club: {
        type: String
    },
    name:{
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
    passwordConfirm: {
        type: String,
        required: true,
        select: false,
        validate: {
            // only works on CREATE and SAVE
            validator: function(el) {
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
        type: mongoose.Schema.ObjectId,
        ref: 'Player'
    },
    joinedDate: {
        type: Date,
        default: Date.now()
    },
    fees: {
        type: [Object]
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

// Virtual Populate
// userSchema.virtual('players', {
//     ref: 'Player',
//     foreignField: 'account',
//     localField: '_id',
//     select: 'name'
// });

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function(next) {
    // this points to the current query
    this.find({ active: { $ne: false } });
    next();
});

userSchema.pre(/^find/, async function(next) {
    this.find({ active: { $ne: false}}); 
    next();
});



userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if(this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10 );

        return JWTTimestamp < changedTimestamp;
    }
    // Password not changed
    return false;
}

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 10000;

    return resetToken;
}

userSchema.method({
    getPlayers: function() {
       if (this.players.length < 1) {
        return 'No Players assigned to this account!';
       } else {
        let players = this.players;
        players.forEach(function(k){
          playerInfo = {
            name: this.player.name
          }
       })
       return playerInfo;
     }
   }
});

// START Convert Schema to Model
const User = mongoose.model('User', userSchema);

export default User; 