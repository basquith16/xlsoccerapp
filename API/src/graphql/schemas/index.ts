import { gql } from 'graphql-tag';
import { baseSchema } from './base';
import { authSchema } from './auth';
import { sessionSchema } from './sessions';
import { templateSchema } from './templates';
import { billingSchema } from './billing';
import { bookingSchema } from './bookings';
import { pageSchema } from './pages';
import { querySchema } from './queries';
import { mutationSchema } from './mutations';

export const typeDefs = gql`
  ${baseSchema}
  ${authSchema}
  ${sessionSchema}
  ${templateSchema}
  ${billingSchema}
  ${bookingSchema}
  ${pageSchema}
  ${querySchema}
  ${mutationSchema}
`; 