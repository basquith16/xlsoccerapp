const mongoose = require('mongoose');

// START Mongoose Schema
const clubSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    url: String,
    geolocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        required: true
    },
    address: {
        type: Object,
        required: true
    },
    sessions: {
        type: Array,
        required: true
    },
    users: Array
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// START Convert Schema to Model
const Club = mongoose.model('Club', clubSchema);

module.exports = Club; 