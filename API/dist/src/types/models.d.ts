import { Document } from 'mongoose';
export interface IUser extends Document {
    club?: string;
    name: string;
    email: string;
    password: string;
    passwordConfirm?: string;
    assignedSessions: any[];
    photo: string;
    role: 'user' | 'coach' | 'admin';
    waiverSigned: boolean;
    joinedDate: Date;
    active: boolean;
    passwordChangedAt?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    players?: any;
    fees?: any[];
    correctPassword(candidatePassword: string, userPassword: string): Promise<boolean>;
    changedPasswordAfter(JWTTimestamp: number): boolean;
    createPasswordResetToken(): string;
}
export interface IPlayer extends Document {
    name: string;
    birthDate: Date;
    sex: 'male' | 'female';
    waiverSigned: boolean;
    isMinor: boolean;
    profImg?: string;
    parent: IUser['_id'];
}
export interface ISession extends Document {
    name: string;
    sport: string;
    demo: string;
    description: string;
    birthYear: string;
    rosterLimit: number;
    price: number;
    startDates: Date[];
    endDate: Date;
    trainer?: string;
    staffOnly: boolean;
    slug: string;
    coverImage?: string;
    images: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface IBooking extends Document {
    session: ISession['_id'];
    user: IUser['_id'];
    price: number;
    createdAt: Date;
    paid: boolean;
}
export interface IReview extends Document {
    review: string;
    rating: number;
    session: ISession['_id'];
    user: IUser['_id'];
    createdAt: Date;
}
export interface IClub extends Document {
    name: string;
    description?: string;
    location?: string;
    contactEmail?: string;
    contactPhone?: string;
}
//# sourceMappingURL=models.d.ts.map