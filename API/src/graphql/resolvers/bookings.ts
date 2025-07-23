import Booking from '../../models/bookingModel';
import Session from '../../models/sessionModel';
import Player from '../../models/playerModel';
import { validateObjectId } from '../../utils/validation';
import { IUser } from '../../types/models';
import { AuthContext } from '../../types/context';

export const bookingResolvers = {
  Query: {
    bookings: async (_: unknown, __: unknown, { user }: { user: IUser | null }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      const familyPlayers = await Player.find({ parent: user._id });
      const playerIds = familyPlayers.map(player => player._id);
      
      const bookings = await Booking.find({ 
        player: { $in: playerIds }
      })
        .populate('session')
        .populate('user', 'id name email')
        .populate('player');
      
      const validBookings = bookings.filter(booking => booking.session);
      
      for (const booking of validBookings) {
        if (booking.session && (booking.session as any).trainers) {
          await (booking.session as any).populate('trainers', 'name');
        }
      }
      
      return validBookings;
    }
  },

  Mutation: {
    createBooking: async (_: unknown, { input }: { input: any }, { user }: { user: IUser | null }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { sessionId, playerId, price } = input;

      if (!validateObjectId(sessionId)) {
        throw new Error('Invalid session ID format');
      }

      if (!validateObjectId(playerId)) {
        throw new Error('Invalid player ID format');
      }

      if (!price || price <= 0) {
        throw new Error('Invalid price');
      }

      const session = await Session.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const player = await Player.findById(playerId);
      if (!player) {
        throw new Error('Player not found');
      }

      if (player.parent.toString() !== user._id.toString()) {
        throw new Error('Player does not belong to you');
      }

      const existingBooking = await Booking.findOne({
        user: user._id,
        session: sessionId
      });

      if (existingBooking) {
        throw new Error('You already have a booking for this session');
      }

      const booking = new Booking({
        user: user._id,
        session: sessionId,
        player: playerId,
        price,
        paid: false
      });

      await booking.save();

      await booking.populate('session');
      await booking.populate('user');
      await booking.populate('player');

      return booking;
    }
  },

  Booking: {
    id: (parent: any) => parent._id || parent.id,
    createdAt: (parent: any) => parent.createdAt?.toISOString ? parent.createdAt.toISOString() : parent.createdAt,
    session: async (parent: any, _: unknown, { loaders }: AuthContext) => {
      if (parent.session && typeof parent.session === 'object') {
        return parent.session;
      }
      
      if (parent.session && typeof parent.session === 'string') {
        return await loaders.sessionLoader.load(parent.session);
      }
      
      return null;
    },
    player: async (parent: any, _: unknown, { loaders }: AuthContext) => {
      if (parent.player && typeof parent.player === 'object') {
        return parent.player;
      }
      
      if (parent.player && typeof parent.player === 'string') {
        return await loaders.playerLoader.load(parent.player);
      }
      
      return null;
    }
  }
}; 