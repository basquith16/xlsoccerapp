import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'src/graphql/schema.ts',
  documents: ['src/**/*.ts'],
  generates: {
    './src/generated/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-resolvers'
      ],
      config: {
        contextType: '../types/context#Context',
        mappers: {
          User: '../models/userModel#IUser',
          Session: '../models/sessionModel#ISession',
          Player: '../models/playerModel#IPlayer',
          Booking: '../models/bookingModel#IBooking',
          Review: '../models/reviewModel#IReview'
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