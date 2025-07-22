import mongoose, { Schema } from 'mongoose';
const schedulePeriodSchema = new Schema({
    template: {
        type: Schema.Types.ObjectId,
        ref: 'SessionTemplate',
        required: [true, 'Template reference is required']
    },
    name: {
        type: String,
        required: [true, 'Period name is required'],
        trim: true,
        maxlength: [100, 'Period name cannot exceed 100 characters']
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required'],
        validate: {
            validator: function (value) {
                return value > this.startDate;
            },
            message: 'End date must be after start date'
        }
    },
    coaches: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
            // Allow empty arrays for TBD periods
        }],
    capacity: {
        type: Number,
        required: [true, 'Capacity is required'],
        min: [1, 'Capacity must be at least 1']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Create indexes for performance
schedulePeriodSchema.index({ template: 1 });
schedulePeriodSchema.index({ startDate: 1 });
schedulePeriodSchema.index({ endDate: 1 });
schedulePeriodSchema.index({ isActive: 1 });
schedulePeriodSchema.index({ coaches: 1 });
// Virtual for checking if period is currently active
schedulePeriodSchema.virtual('isCurrentlyActive').get(function () {
    const now = new Date();
    return this.isActive && now >= this.startDate && now <= this.endDate;
});
// Virtual for checking if period is in the future
schedulePeriodSchema.virtual('isUpcoming').get(function () {
    const now = new Date();
    return this.isActive && now < this.startDate;
});
// Virtual for checking if period is in the past
schedulePeriodSchema.virtual('isPast').get(function () {
    const now = new Date();
    return now > this.endDate;
});
// Virtual relationships
schedulePeriodSchema.virtual('templateInfo', {
    ref: 'SessionTemplate',
    localField: 'template',
    foreignField: '_id',
    justOne: true
});
schedulePeriodSchema.virtual('instances', {
    ref: 'SessionInstance',
    localField: '_id',
    foreignField: 'period'
});
// Virtual for instances count
schedulePeriodSchema.virtual('instancesCount', {
    ref: 'SessionInstance',
    localField: '_id',
    foreignField: 'period',
    count: true
});
// Virtual for active instances count
schedulePeriodSchema.virtual('activeInstancesCount', {
    ref: 'SessionInstance',
    localField: '_id',
    foreignField: 'period',
    count: true,
    match: { isActive: true, isCancelled: false }
});
const SchedulePeriod = mongoose.model('SchedulePeriod', schedulePeriodSchema);
export default SchedulePeriod;
