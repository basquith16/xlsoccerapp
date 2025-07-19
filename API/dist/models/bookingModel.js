import mongoose, { Schema } from 'mongoose';
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
const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
