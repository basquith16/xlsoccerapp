import mongoose, { Schema } from 'mongoose';
// Define enums for better type safety
export var SportType;
(function (SportType) {
    SportType["SOCCER"] = "Soccer";
    SportType["VOLLEYBALL"] = "Volleyball";
    SportType["BASKETBALL"] = "Basketball";
    SportType["TENNIS"] = "Tennis";
    SportType["BASEBALL"] = "Baseball";
    SportType["FOOTBALL"] = "Football";
})(SportType || (SportType = {}));
export var DemoType;
(function (DemoType) {
    DemoType["YOUTH"] = "Youth";
    DemoType["TEEN"] = "Teen";
    DemoType["ADULT"] = "Adult";
    DemoType["ELITE"] = "Elite";
    DemoType["BEGINNER"] = "Beginner";
    DemoType["INTERMEDIATE"] = "Intermediate";
    DemoType["ADVANCED"] = "Advanced";
})(DemoType || (DemoType = {}));
const sessionTemplateSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Session template name is required'],
        trim: true,
        maxlength: [100, 'Session template name cannot exceed 100 characters']
    },
    sport: {
        type: String,
        required: [true, 'Sport is required'],
        enum: Object.values(SportType),
        trim: true
    },
    demo: {
        type: String,
        required: [true, 'Demo is required'],
        enum: Object.values(DemoType),
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    birthYear: {
        type: String,
        required: [true, 'Birth year is required'],
        trim: true
    },
    rosterLimit: {
        type: Number,
        required: [true, 'Roster limit is required'],
        min: [1, 'Roster limit must be at least 1'],
        max: [100, 'Roster limit cannot exceed 100']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
        max: [10000, 'Price cannot exceed 10000']
    },
    trainer: {
        type: String,
        trim: true,
        maxlength: [100, 'Trainer name cannot exceed 100 characters']
    },
    staffOnly: {
        type: Boolean,
        default: false
    },
    slug: {
        type: String,
        required: [true, 'Slug is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
    },
    coverImage: {
        type: String,
        trim: true
    },
    images: [{
            type: String,
            trim: true
        }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Create indexes for performance (slug is already unique from schema)
sessionTemplateSchema.index({ isActive: 1 });
sessionTemplateSchema.index({ sport: 1 });
sessionTemplateSchema.index({ staffOnly: 1 });
// Virtual for checking if template is publicly visible
sessionTemplateSchema.virtual('isPubliclyVisible').get(function () {
    return this.isActive && !this.staffOnly;
});
// Virtual relationships
sessionTemplateSchema.virtual('periods', {
    ref: 'SchedulePeriod',
    localField: '_id',
    foreignField: 'template'
});
sessionTemplateSchema.virtual('instances', {
    ref: 'SessionInstance',
    localField: '_id',
    foreignField: 'template'
});
// Virtual for active periods count
sessionTemplateSchema.virtual('activePeriodsCount', {
    ref: 'SchedulePeriod',
    localField: '_id',
    foreignField: 'template',
    count: true,
    match: { isActive: true }
});
// Virtual for upcoming instances count
sessionTemplateSchema.virtual('upcomingInstancesCount', {
    ref: 'SessionInstance',
    localField: '_id',
    foreignField: 'template',
    count: true,
    match: {
        isActive: true,
        isCancelled: false,
        date: { $gte: new Date() }
    }
});
const SessionTemplate = mongoose.model('SessionTemplate', sessionTemplateSchema);
export default SessionTemplate;
