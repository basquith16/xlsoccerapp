import Session from '../../models/sessionModel';
import Booking from '../../models/bookingModel';
import { validateObjectId } from '../../utils/validation';
import { AuthContext } from '../../types/context';

export const sessionResolvers = {
  Query: {
    sessions: async (_: unknown, { limit = 100, offset = 0 }: { limit?: number; offset?: number }) => {
      const sessions = await Session.find({})
        .populate('trainers', 'name')
        .limit(limit)
        .skip(offset);
      
      const totalCount = await Session.countDocuments({});
      const hasNextPage = offset + limit < totalCount;
      
      return {
        nodes: sessions,
        totalCount,
        hasNextPage
      };
    },

    adminSessions: async (_: unknown, { limit = 100, offset = 0 }: { limit?: number; offset?: number }, { user }: { user: any | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized - Admin access required');
      }
      
      const sessions = await Session.find({})
        .populate('trainers', 'name')
        .lean()
        .limit(limit)
        .skip(offset);
      
      const totalCount = await Session.countDocuments({});
      const hasNextPage = offset + limit < totalCount;
      
      return {
        nodes: sessions,
        totalCount,
        hasNextPage
      };
    },

    session: async (_: unknown, { id }: { id: string }) => {
      if (!validateObjectId(id)) {
        throw new Error('Invalid session ID format');
      }
      const session = await Session.findById(id).populate('trainers', 'name');
      if (!session) {
        throw new Error('Session not found');
      }
      return session;
    },

    sessionBySlug: async (_: unknown, { slug }: { slug: string }) => {
      if (!slug) {
        throw new Error('Slug is required');
      }
      const session = await Session.findOne({ slug }).populate('trainers', 'name');
      if (!session) {
        throw new Error('Session not found');
      }
      return session;
    }
  },

  Mutation: {
    createSession: async (_: unknown, { input }: { input: any }, { user }: { user: any | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized - Admin access required');
      }

      try {
        console.log('Creating session with input:', JSON.stringify(input, null, 2));
        
        // Parse ageRange string into object if provided
        if (input.ageRange) {
          const ageRangeMatch = input.ageRange.match(/(\d+)-(\d+)/);
          if (ageRangeMatch) {
            input.ageRange = {
              minAge: parseInt(ageRangeMatch[1]),
              maxAge: parseInt(ageRangeMatch[2])
            };
          } else {
            // If no match, try to parse as single age
            const singleAge = parseInt(input.ageRange);
            if (!isNaN(singleAge)) {
              input.ageRange = {
                minAge: singleAge,
                maxAge: singleAge
              };
            } else {
              throw new Error('Invalid age range format. Use format like "8-12" or "10"');
            }
          }
        } else {
          // Set default ageRange if not provided
          input.ageRange = {
            minAge: 0,
            maxAge: 0
          };
        }

        console.log('Processed input:', JSON.stringify(input, null, 2));

        const session = new Session({
          ...input,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log('Session object created:', session);
        
        await session.save();
        
        console.log(`Admin ${user.email} created session: ${session.name} (ID: ${session._id})`);
        console.log('Saved session:', JSON.stringify(session.toObject(), null, 2));
        
        return session;
      } catch (error: any) {
        console.error('Error creating session:', error);
        throw new Error(error.message || 'Failed to create session');
      }
    },

    updateSession: async (_: unknown, { id, input }: { id: string; input: any }, { user }: { user: any | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized - Admin access required');
      }

      if (!validateObjectId(id)) {
        throw new Error('Invalid session ID format');
      }

      try {
        const session = await Session.findByIdAndUpdate(
          id,
          { ...input, updatedAt: new Date() },
          { new: true, runValidators: true }
        );

        if (!session) {
          throw new Error('Session not found');
        }

        console.log(`Admin ${user.email} updated session: ${session.name} (ID: ${session._id})`);
        
        return session;
      } catch (error: any) {
        console.error('Error updating session:', error);
        throw new Error(error.message || 'Failed to update session');
      }
    },

    deleteSession: async (_: unknown, { id }: { id: string }, { user }: { user: any | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized - Admin access required');
      }

      if (!validateObjectId(id)) {
        throw new Error('Invalid session ID format');
      }

      try {
        const session = await Session.findById(id);
        if (!session) {
          throw new Error('Session not found');
        }

        const bookingCount = await Booking.countDocuments({ session: id });
        if (bookingCount > 0) {
          throw new Error(`Cannot delete session with ${bookingCount} existing bookings`);
        }

        await Session.findByIdAndDelete(id);

        console.log(`Admin ${user.email} deleted session: ${session.name} (ID: ${session._id})`);
        
        return 'Session deleted successfully';
      } catch (error: any) {
        console.error('Error deleting session:', error);
        throw new Error(error.message || 'Failed to delete session');
      }
    }
  },

  Session: {
    id: (parent: any) => parent._id || parent.id,
    ageRange: (parent: any) => {
      // If ageRange is null/undefined, return null (GraphQL will handle this)
      if (!parent.ageRange) return null;
      
      // Ensure minAge and maxAge are numbers, defaulting to 0 if undefined
      return {
        minAge: typeof parent.ageRange.minAge === 'number' ? parent.ageRange.minAge : 0,
        maxAge: typeof parent.ageRange.maxAge === 'number' ? parent.ageRange.maxAge : 0
      };
    },
    startDates: (parent: any) => {
      if (!parent.startDates) return [];
      return parent.startDates.map((date: any) => 
        date instanceof Date ? date.toISOString() : date
      );
    },
    endDate: (parent: any) => {
      if (!parent.endDate) return null;
      return parent.endDate instanceof Date ? parent.endDate.toISOString() : parent.endDate;
    },
    createdAt: (parent: any) => {
      if (!parent.createdAt) {
        // If createdAt is missing, use current time
        return new Date().toISOString();
      }
      return parent.createdAt instanceof Date ? parent.createdAt.toISOString() : parent.createdAt;
    },
    updatedAt: (parent: any) => {
      if (!parent.updatedAt) {
        // If updatedAt is missing, use current time
        return new Date().toISOString();
      }
      return parent.updatedAt instanceof Date ? parent.updatedAt.toISOString() : parent.updatedAt;
    },
    availableSpots: (parent: any) => {
      return parent.availableSpots || parent.rosterLimit || 0;
    },
    isActive: (parent: any) => {
      return parent.active !== undefined ? parent.active : true;
    },
    isPubliclyVisible: (parent: any) => {
      return parent.active !== undefined ? parent.active : true;
    },
    images: (parent: any) => {
      return parent.images || parent.image || [];
    },
    coverImage: (parent: any) => {
      return parent.coverImage || (parent.image && parent.image.length > 0 ? parent.image[0] : null);
    },
    trainers: async (parent: any, _: unknown, { loaders }: AuthContext) => {
      if (parent.trainers && Array.isArray(parent.trainers) && parent.trainers.length > 0) {
        // If trainers are already populated as objects, return them
        if (typeof parent.trainers[0] === 'object' && parent.trainers[0]._id) {
          return parent.trainers;
        }
        // If trainers are IDs, use DataLoader to batch load them
        if (typeof parent.trainers[0] === 'string') {
          const trainers = await Promise.all(
            parent.trainers.map((trainerId: string) => loaders.userLoader.load(trainerId))
          );
          return trainers.filter(Boolean); // Remove null values
        }
      }
      return [];
    },
    trainer: async (parent: any, _: unknown, { loaders }: AuthContext) => {
      if (parent.trainers && Array.isArray(parent.trainers) && parent.trainers.length > 0) {
        let trainers;
        
        // If trainers are already populated as objects, use them
        if (typeof parent.trainers[0] === 'object' && parent.trainers[0]._id) {
          trainers = parent.trainers;
        } 
        // If trainers are IDs, use DataLoader to batch load them
        else if (typeof parent.trainers[0] === 'string') {
          trainers = await Promise.all(
            parent.trainers.map((trainerId: string) => loaders.userLoader.load(trainerId))
          );
          trainers = trainers.filter(Boolean); // Remove null values
        }
        
        if (trainers && trainers.length > 0) {
          const firstTrainer = trainers.find((trainer: any) => {
            if (trainer && trainer.name) {
              return !trainer.name.toLowerCase().includes('admin') && 
                     !trainer.name.toLowerCase().includes('test');
            }
            return false;
          });
          
          if (firstTrainer && firstTrainer.name) {
            return firstTrainer.name;
          }
        }
      }
      return parent.trainer || null;
    }
  },

  SessionSummary: {
    id: (parent: any) => parent._id || parent.id,
    ageRange: (parent: any) => {
      if (!parent.ageRange) return null;
      return {
        minAge: parent.ageRange.minAge || 0,
        maxAge: parent.ageRange.maxAge || 0
      };
    },
    startDates: (parent: any) => {
      if (!parent.startDates) return [];
      return parent.startDates.map((date: any) => 
        date instanceof Date ? date.toISOString() : date
      );
    },
    endDate: (parent: any) => {
      if (!parent.endDate) return null;
      return parent.endDate instanceof Date ? parent.endDate.toISOString() : parent.endDate;
    },
    createdAt: (parent: any) => {
      if (!parent.createdAt) return new Date().toISOString(); // Default to current time if missing
      return parent.createdAt instanceof Date ? parent.createdAt.toISOString() : parent.createdAt;
    },
    updatedAt: (parent: any) => {
      if (!parent.updatedAt) return new Date().toISOString(); // Default to current time if missing
      return parent.updatedAt instanceof Date ? parent.updatedAt.toISOString() : parent.updatedAt;
    },
    availableSpots: (parent: any) => {
      return parent.availableSpots || parent.rosterLimit || 0;
    }
  }
}; 