import mongoose, { Schema } from 'mongoose';
// Mongoose Schema
const clubSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    location: {
        type: String
    },
    contactEmail: {
        type: String
    },
    contactPhone: {
        type: String
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Create and export model
const Club = mongoose.model('Club', clubSchema);
export default Club;
