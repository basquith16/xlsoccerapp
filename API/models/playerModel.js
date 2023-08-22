const mongoose = require('mongoose');

// START Mongoose Schema
const playerSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    birthDate: {
        type: String,
        required: true
    },
    sex: {
        type: String,
        required: true,
        enum: ['male', 'female', 'prefer not to answer']
    },
    waiverSigned: {
        type: Boolean,
        required: true,
        default: false
    },
    teams: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Session'
    }],
    account: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Player must belong to a user account']
      },
    isMinor: {
        type: Boolean,
        required: true
    },
    profImg: {
        type: Array,
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


// START Convert Schema to Model
const Player = mongoose.model('Player', playerSchema);

module.exports = Player; 

// Document Middleware
playerSchema.pre('save', function(next) {
    if (this.sex === 'male') {
        this.profImg = 'default-male.jpg';
    } else if (this.sex === 'female') {
        this.profImg = 'default-female.jpg';
    } else {
        this.profImg = 'default.jpg';
    }
    
    next();
});
