import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../src/graphql/schema.ts',
  documents: ['../src/**/*.ts'],
  generates: {
    '../src/generated/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-resolvers'
      ],
      config: {
        contextType: '../src/types/context#Context',
        mappers: {
          User: '../src/models/userModel#IUser',
          Session: '../src/models/sessionModel#ISession',
          Player: '../src/models/playerModel#IPlayer',
          Booking: '../src/models/bookingModel#IBooking',
          Review: '../src/models/reviewModel#IReview'
        },
        scalars: {
          Date: 'Date',
          ObjectId: 'string'
        }
      }
    }
  }
};

export default config; 