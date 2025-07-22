import { authResolvers } from './auth';
import { userResolvers } from './users';
import { sessionResolvers } from './sessions';
import { bookingResolvers } from './bookings';
import { billingResolvers } from './billing';
import { templateResolvers } from './templates';
import { periodResolvers } from './periods';
import { instanceResolvers } from './instances';
import { familyResolvers } from './family';

// Combine all resolvers
export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...sessionResolvers.Query,
    ...bookingResolvers.Query,
    ...billingResolvers.Query,
    ...templateResolvers.Query,
    ...periodResolvers.Query,
    ...instanceResolvers.Query,
    ...familyResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...userResolvers.Mutation,
    ...sessionResolvers.Mutation,
    ...bookingResolvers.Mutation,
    ...billingResolvers.Mutation,
    ...templateResolvers.Mutation,
    ...periodResolvers.Mutation,
    ...instanceResolvers.Mutation,
    ...familyResolvers.Mutation,
  },
  Session: {
    ...sessionResolvers.Session,
  },
  SessionSummary: {
    ...sessionResolvers.SessionSummary,
  },
  Booking: {
    ...bookingResolvers.Booking,
  },
  Player: {
    ...familyResolvers.Player,
  },
  User: {
    ...userResolvers.User,
  },
};

export default resolvers; 