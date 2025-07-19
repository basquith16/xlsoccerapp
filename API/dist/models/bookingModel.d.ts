export default Booking;
declare const Booking: mongoose.Model<{
    createdAt: NativeDate;
    session: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    price: number;
    paid: boolean;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    session: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    price: number;
    paid: boolean;
}, {}> & {
    createdAt: NativeDate;
    session: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    price: number;
    paid: boolean;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    createdAt: NativeDate;
    session: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    price: number;
    paid: boolean;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    session: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    price: number;
    paid: boolean;
}>, {}> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    session: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    price: number;
    paid: boolean;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
import mongoose from 'mongoose';
//# sourceMappingURL=bookingModel.d.ts.map