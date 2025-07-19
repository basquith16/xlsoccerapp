export default Club;
declare const Club: mongoose.Model<{
    name: string;
    sessions: any[];
    users: any[];
    geolocation: {
        type: "Point";
        coordinates: number[];
        required?: unknown;
    };
    address: any;
    url?: string;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    name: string;
    sessions: any[];
    users: any[];
    geolocation: {
        type: "Point";
        coordinates: number[];
        required?: unknown;
    };
    address: any;
    url?: string;
}, {}> & {
    name: string;
    sessions: any[];
    users: any[];
    geolocation: {
        type: "Point";
        coordinates: number[];
        required?: unknown;
    };
    address: any;
    url?: string;
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
    name: string;
    sessions: any[];
    users: any[];
    geolocation: {
        type: "Point";
        coordinates: number[];
        required?: unknown;
    };
    address: any;
    url?: string;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    name: string;
    sessions: any[];
    users: any[];
    geolocation: {
        type: "Point";
        coordinates: number[];
        required?: unknown;
    };
    address: any;
    url?: string;
}>, {}> & mongoose.FlatRecord<{
    name: string;
    sessions: any[];
    users: any[];
    geolocation: {
        type: "Point";
        coordinates: number[];
        required?: unknown;
    };
    address: any;
    url?: string;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
import mongoose from 'mongoose';
//# sourceMappingURL=clubModel.d.ts.map