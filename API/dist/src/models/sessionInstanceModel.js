import mongoose, { Schema } from 'mongoose';
const sessionInstanceSchema = new Schema({
    period: {
        type: Schema.Types.ObjectId,
        ref: 'SchedulePeriod',
        required: [true, 'Period reference is required']
    },
    template: {
        type: Schema.Types.ObjectId,
        ref: 'SessionTemplate',
        required: [true, 'Template reference is required']
    },
    name: {
        type: String,
        required: [true, 'Session name is required'],
        trim: true,
        maxlength: [100, 'Session name cannot exceed 100 characters']
    },
    date: {
        type: Date,
        required: [true, 'Session date is required']
    },
    startTime: {
        type: String,
        required: [true, 'Start time is required'],
        trim: true
    },
    endTime: {
        type: String,
        required: [true, 'End time is required'],
        trim: true,
        validate: {
            validator: function (value) {
                if (!this.startTime)
                    return true; // Skip validation if startTime not set yet
                const startTime = new Date(`2000-01-01T${this.startTime}`);
                const endTime = new Date(`2000-01-01T${value}`);
                return endTime > startTime;
            },
            message: 'End time must be after start time'
        }
    },
    coaches: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
    capacity: {
        type: Number,
        required: [true, 'Capacity is required'],
        min: [1, 'Capacity must be at least 1']
    },
    bookedCount: {
        type: Number,
        default: 0,
        min: [0, 'Booked count cannot be negative']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isCancelled: {
        type: Boolean,
        default: false
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Create indexes for performance
sessionInstanceSchema.index({ period: 1 });
sessionInstanceSchema.index({ template: 1 });
sessionInstanceSchema.index({ date: 1 });
sessionInstanceSchema.index({ isActive: 1 });
sessionInstanceSchema.index({ isCancelled: 1 });
sessionInstanceSchema.index({ coaches: 1 });
// Virtual for checking if session is available for booking
sessionInstanceSchema.virtual('isAvailable').get(function () {
    return this.isActive && !this.isCancelled && this.bookedCount < this.capacity;
});
// Virtual for checking if session is full
sessionInstanceSchema.virtual('isFull').get(function () {
    return this.bookedCount >= this.capacity;
});
// Virtual for checking if session is in the past
sessionInstanceSchema.virtual('isPast').get(function () {
    const now = new Date();
    const sessionDateTime = new Date(this.date);
    sessionDateTime.setHours(parseInt(this.endTime.split(':')[0]), parseInt(this.endTime.split(':')[1]));
    return now > sessionDateTime;
});
// Virtual for checking if session is today
sessionInstanceSchema.virtual('isToday').get(function () {
    const now = new Date();
    const sessionDate = new Date(this.date);
    return now.toDateString() === sessionDate.toDateString();
});
// Virtual for available spots
sessionInstanceSchema.virtual('availableSpots').get(function () {
    return Math.max(0, this.capacity - this.bookedCount);
});
// Virtual relationships
sessionInstanceSchema.virtual('templateInfo', {
    ref: 'SessionTemplate',
    localField: 'template',
    foreignField: '_id',
    justOne: true
});
sessionInstanceSchema.virtual('periodInfo', {
    ref: 'SchedulePeriod',
    localField: 'period',
    foreignField: '_id',
    justOne: true
});
// Virtual for coach information
sessionInstanceSchema.virtual('coachInfo', {
    ref: 'User',
    localField: 'coaches',
    foreignField: '_id'
});
// Virtual for booking percentage
sessionInstanceSchema.virtual('bookingPercentage').get(function () {
    if (this.capacity === 0)
        return 0;
    return Math.round((this.bookedCount / this.capacity) * 100);
});
const SessionInstance = mongoose.model('SessionInstance', sessionInstanceSchema);
export default SessionInstance;
