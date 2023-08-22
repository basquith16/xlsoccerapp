const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.ObjectId,
        ref: 'Session',
        required: [true, 'Booking must belong to a Session']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Booking must belong to a User']
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
        default: true
    }
});

bookingSchema.pre(/^find/, function (next) {
    this.populate('user').populate({
        path: 'session',
        select: 'name'
    });

    next();
})

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;