import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import { GraphQLJSON } from 'graphql-type-json';
import { authResolvers } from './auth';
import { userResolvers } from './users';
import { sessionResolvers } from './sessions';
import { bookingResolvers } from './bookings';
import { billingResolvers } from './billing';
// import { paymentProviderResolvers } from './paymentProviders'; // Moved to billing resolvers
import { templateResolvers } from './templates';
import { periodResolvers } from './periods';
import { instanceResolvers } from './instances';
import { familyResolvers } from './family';
import { pageResolvers } from './pages';

// Date scalar resolver
const DateType = new GraphQLScalarType({
  name: 'Date',
  serialize: (value: any) => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string' || typeof value === 'number') {
      return new Date(value).toISOString();
    }
    throw new Error('Value must be a Date instance, string, or number');
  },
  parseValue: (value: any) => {
    if (typeof value === 'string' || typeof value === 'number') {
      return new Date(value);
    }
    throw new Error('Value must be a string or number');
  },
  parseLiteral: (ast: any) => {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      return new Date(ast.value);
    }
    throw new Error('Can only parse strings and integers to dates');
  },
});

// Combine all resolvers
export const resolvers = {
  Date: DateType,
  JSON: GraphQLJSON,
  Query: {
    ...userResolvers.Query,
    ...sessionResolvers.Query,
    ...bookingResolvers.Query,
    ...billingResolvers.Query,
    // ...paymentProviderResolvers.Query, // Moved to billing resolvers
    ...templateResolvers.Query,
    ...periodResolvers.Query,
    ...instanceResolvers.Query,
    ...familyResolvers.Query,
    ...pageResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...userResolvers.Mutation,
    ...sessionResolvers.Mutation,
    ...bookingResolvers.Mutation,
    ...billingResolvers.Mutation,
    // ...paymentProviderResolvers.Mutation, // Moved to billing resolvers
    ...templateResolvers.Mutation,
    ...periodResolvers.Mutation,
    ...instanceResolvers.Mutation,
    ...familyResolvers.Mutation,
    ...pageResolvers.Mutation,
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