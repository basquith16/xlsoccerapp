export default Player;
declare const Player: mongoose.Model<{
    name: string;
    waiverSigned: boolean;
    account: mongoose.Types.ObjectId;
    teams: mongoose.Types.ObjectId[];
    birthDate: string;
    sex: "male" | "female" | "prefer not to answer";
    isMinor: boolean;
    profImg: any[];
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    name: string;
    waiverSigned: boolean;
    account: mongoose.Types.ObjectId;
    teams: mongoose.Types.ObjectId[];
    birthDate: string;
    sex: "male" | "female" | "prefer not to answer";
    isMinor: boolean;
    profImg: any[];
}, {}> & {
    name: string;
    waiverSigned: boolean;
    account: mongoose.Types.ObjectId;
    teams: mongoose.Types.ObjectId[];
    birthDate: string;
    sex: "male" | "female" | "prefer not to answer";
    isMinor: boolean;
    profImg: any[];
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
    waiverSigned: boolean;
    account: mongoose.Types.ObjectId;
    teams: mongoose.Types.ObjectId[];
    birthDate: string;
    sex: "male" | "female" | "prefer not to answer";
    isMinor: boolean;
    profImg: any[];
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    name: string;
    waiverSigned: boolean;
    account: mongoose.Types.ObjectId;
    teams: mongoose.Types.ObjectId[];
    birthDate: string;
    sex: "male" | "female" | "prefer not to answer";
    isMinor: boolean;
    profImg: any[];
}>, {}> & mongoose.FlatRecord<{
    name: string;
    waiverSigned: boolean;
    account: mongoose.Types.ObjectId;
    teams: mongoose.Types.ObjectId[];
    birthDate: string;
    sex: "male" | "female" | "prefer not to answer";
    isMinor: boolean;
    profImg: any[];
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
import mongoose from 'mongoose';
//# sourceMappingURL=playerModel.d.ts.map