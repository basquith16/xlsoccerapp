import mongoose, { Schema } from 'mongoose';
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
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Create and export model
const Player = mongoose.model('Player', playerSchema);
export default Player;
