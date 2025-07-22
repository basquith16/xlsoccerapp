import { gql } from 'graphql-tag';
import { authSchema } from './auth';
import { sessionSchema } from './sessions';
import { templateSchema } from './templates';
import { billingSchema } from './billing';
import { bookingSchema } from './bookings';
import { querySchema } from './queries';
import { mutationSchema } from './mutations';

export const typeDefs = gql`
  ${authSchema}
  ${sessionSchema}
  ${templateSchema}
  ${billingSchema}
  ${bookingSchema}
  ${querySchema}
  ${mutationSchema}
`; 