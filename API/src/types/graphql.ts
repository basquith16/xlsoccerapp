import { Document } from 'mongoose';
import { IUser, IPlayer, ISession, IBooking, IReview } from './models.js';

// GraphQL Input Types
export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  photo?: string;
}

export interface CreateSessionInput {
  name: string;
  sport: string;
  demo: string;
  description?: string;
  birthYear: number;
  rosterLimit: number;
  price: number;
  priceDiscount?: number;
  startDates: string[];
  endDate: string;
  timeStart: string;
  timeEnd: string;
  trainer?: string;
  staffOnly: boolean;
  coverImage?: string;
  images?: string[];
}

export interface UpdateSessionInput {
  name?: string;
  sport?: string;
  demo?: string;
  description?: string;
  birthYear?: number;
  rosterLimit?: number;
  price?: number;
  priceDiscount?: number;
  startDates?: string[];
  endDate?: string;
  timeStart?: string;
  timeEnd?: string;
  trainer?: string;
  staffOnly?: boolean;
  coverImage?: string;
  images?: string[];
}

export interface CreateBookingInput {
  sessionId: string;
  price: number;
}

export interface CreateReviewInput {
  sessionId: string;
  review: string;
  rating: number;
}

// GraphQL Response Types
export interface GraphQLError {
  message: string;
  code: string;
  field?: string;
}

export interface AuthResponse {
  status: string;
  token: string;
  data: IUser | null;
  errors: GraphQLError[];
}

export interface PasswordResetResponse {
  status: string;
  message: string;
  errors: GraphQLError[];
}

export interface SessionConnection {
  nodes: ISession[];
  totalCount: number;
  hasNextPage: boolean;
}

// Resolver Context
export interface GraphQLContext {
  user?: {
    id: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
  } | null;
}

// Resolver Arguments
export interface QueryArgs {
  limit?: number;
  offset?: number;
  id?: string;
  slug?: string;
}

export interface MutationArgs {
  input?: CreateUserInput | LoginInput | UpdateUserInput | CreateSessionInput | UpdateSessionInput | CreateBookingInput | CreateReviewInput;
  email?: string;
  token?: string;
  password?: string;
  passwordConfirm?: string;
  currentPassword?: string;
  newPassword?: string;
  newPasswordConfirm?: string;
  sessionId?: string;
  review?: string;
  rating?: number;
}

// Cache Types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface SessionCache {
  nodes: ISession[];
  totalCount: number;
  hasNextPage: boolean;
} 