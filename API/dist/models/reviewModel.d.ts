export default Review;
declare const Review: mongoose.Model<{
    createdAt: NativeDate;
    user: mongoose.Types.ObjectId;
    review: string;
    rating?: number;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    user: mongoose.Types.ObjectId;
    review: string;
    rating?: number;
}, {}> & {
    createdAt: NativeDate;
    user: mongoose.Types.ObjectId;
    review: string;
    rating?: number;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    toJSON: {
        virtuals: true;
    };
    toObject: {
        virtuals: true;
    };
}, {
    createdAt: NativeDate;
    user: mongoose.Types.ObjectId;
    review: string;
    rating?: number;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    user: mongoose.Types.ObjectId;
    review: string;
    rating?: number;
}>, {}> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    user: mongoose.Types.ObjectId;
    review: string;
    rating?: number;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
import mongoose from 'mongoose';
//# sourceMappingURL=reviewModel.d.ts.map