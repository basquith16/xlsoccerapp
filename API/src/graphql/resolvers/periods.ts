import SchedulePeriod from '../../models/schedulePeriodModel';
import User from '../../models/userModel';
import { validateObjectId } from '../../utils/validation';
import { IUser } from '../../types/models';

// Helper function to convert Mongoose documents to plain objects with string IDs
const convertToPlainObject = (doc: any) => {
  if (!doc) return doc;
  const plain = doc.toObject ? doc.toObject() : doc;
  
  // Convert ObjectIds to strings
  if (plain._id) {
    plain.id = plain._id.toString();
    delete plain._id;
  }
  
  // Convert Date objects to ISO strings
  if (plain.startDate) {
    plain.startDate = new Date(plain.startDate).toISOString();
  }
  if (plain.endDate) {
    plain.endDate = new Date(plain.endDate).toISOString();
  }
  if (plain.createdAt) {
    plain.createdAt = new Date(plain.createdAt).toISOString();
  }
  if (plain.updatedAt) {
    plain.updatedAt = new Date(plain.updatedAt).toISOString();
  }
  
  // Map templateInfo to template field for GraphQL
  if (plain.templateInfo) {
    plain.template = plain.templateInfo;
    delete plain.templateInfo;
  } else {
    // If templateInfo is null/undefined, provide a default template object
    plain.template = {
      id: plain.template || 'unknown',
      name: 'Unknown Template',
      sport: 'Unknown',
      demo: 'Unknown'
    };
  }
  
  // Handle coaches array - ensure all coaches have required fields
  if (plain.coaches && Array.isArray(plain.coaches)) {
    plain.coaches = plain.coaches.map((coach: any) => {
      if (!coach) return null;
      
      const coachObj = typeof coach === 'object' ? coach : { id: coach };
      
      // Ensure coach has required fields
      return {
        id: coachObj.id || coachObj._id?.toString() || 'unknown',
        name: coachObj.name || 'Unknown Coach',
        email: coachObj.email || 'unknown@example.com',
        role: coachObj.role || 'coach'
      };
    }).filter(Boolean); // Remove null entries
  } else {
    plain.coaches = [];
  }
  
  return plain;
};

const convertArrayToPlainObjects = (docs: any[]) => {
  return docs.map(convertToPlainObject);
};

export const periodResolvers = {
  Query: {
    schedulePeriods: async (_: unknown, { limit = 10, offset = 0 }: { limit?: number; offset?: number }) => {
      const periods = await SchedulePeriod.find({ isActive: true })
        .populate('templateInfo')
        .populate('instances')
        .populate('coaches')
        .limit(limit)
        .skip(offset);

      const totalCount = await SchedulePeriod.countDocuments({ isActive: true });
      const hasNextPage = offset + limit < totalCount;

      return {
        nodes: convertArrayToPlainObjects(periods),
        totalCount,
        hasNextPage
      };
    },

    schedulePeriod: async (_: unknown, { id }: { id: string }) => {
      if (!validateObjectId(id)) {
        throw new Error('Invalid period ID');
      }

      const period = await SchedulePeriod.findById(id)
        .populate('templateInfo')
        .populate('instances')
        .populate('coaches');

      if (!period) {
        throw new Error('Schedule period not found');
      }

      return convertToPlainObject(period);
    },

    schedulePeriodsByTemplate: async (_: unknown, { templateId, limit = 10, offset = 0 }: { templateId: string; limit?: number; offset?: number }) => {
      if (!validateObjectId(templateId)) {
        throw new Error('Invalid template ID');
      }

      const periods = await SchedulePeriod.find({ template: templateId, isActive: true })
        .populate('templateInfo')
        .populate('instances')
        .populate('coaches')
        .limit(limit)
        .skip(offset);

      const totalCount = await SchedulePeriod.countDocuments({ template: templateId, isActive: true });
      const hasNextPage = offset + limit < totalCount;

      return {
        nodes: convertArrayToPlainObjects(periods),
        totalCount,
        hasNextPage
      };
    },

    adminSchedulePeriods: async (_: unknown, { limit = 10, offset = 0 }: { limit?: number; offset?: number }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized - Admin access required');
      }

      const periods = await SchedulePeriod.find({})
        .populate('templateInfo')
        .populate('instances')
        .populate('coaches')
        .limit(limit)
        .skip(offset);

      const totalCount = await SchedulePeriod.countDocuments({});
      const hasNextPage = offset + limit < totalCount;

      return {
        nodes: convertArrayToPlainObjects(periods),
        totalCount,
        hasNextPage
      };
    },

    adminCoaches: async (_: unknown, __: unknown, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized - Admin access required');
      }

      try {
        const coaches = await User.find({ 
          $or: [
            { role: 'coach' },
            { email: 'tbd@system.local' }
          ]
        }).sort({ name: 1 });
        return convertArrayToPlainObjects(coaches);
      } catch (error: any) {
        console.error('Error fetching coaches:', error);
        throw new Error('Failed to fetch coaches');
      }
    }
  },

  Mutation: {
    createSchedulePeriod: async (_: unknown, { input }: { input: any }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized - Admin access required');
      }

      try {
        let coachIds = input.coachIds || [];
        if (coachIds.includes('TBD')) {
          let tbdUser = await User.findOne({ email: 'tbd@system.local' });
          if (!tbdUser) {
            tbdUser = await User.create({
              name: 'TBD - To Be Determined',
              email: 'tbd@system.local',
              role: 'coach',
              active: true,
              waiverSigned: true,
              joinedDate: new Date()
            });
          }
          coachIds = coachIds.map(id => id === 'TBD' ? tbdUser._id.toString() : id);
        }

        const periodData = {
          template: input.templateId,
          name: input.name,
          startDate: input.startDate,
          endDate: input.endDate,
          coaches: coachIds,
          capacity: input.capacity,
          isActive: input.isActive !== undefined ? input.isActive : true
        };

        const period = new SchedulePeriod(periodData);
        const savedPeriod = await period.save();
        console.log(`Admin ${user.email} created schedule period: ${savedPeriod.name} (ID: ${savedPeriod._id})`);
        return savedPeriod;
      } catch (error: any) {
        console.error('Error creating schedule period:', error);
        throw new Error(error.message || 'Failed to create schedule period');
      }
    },

    updateSchedulePeriod: async (_: unknown, { id, input }: { id: string; input: any }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized - Admin access required');
      }

      if (!validateObjectId(id)) {
        throw new Error('Invalid schedule period ID format');
      }

      try {
        const updateData: any = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.startDate !== undefined) updateData.startDate = input.startDate;
        if (input.endDate !== undefined) updateData.endDate = input.endDate;
        if (input.coachIds !== undefined) updateData.coaches = input.coachIds.filter(id => id !== 'TBD');
        if (input.capacity !== undefined) updateData.capacity = input.capacity;
        if (input.isActive !== undefined) updateData.isActive = input.isActive;

        const period = await SchedulePeriod.findByIdAndUpdate(id, updateData, { new: true });
        if (!period) {
          throw new Error('Schedule period not found');
        }
        console.log(`Admin ${user.email} updated schedule period: ${period.name} (ID: ${period._id})`);
        return period;
      } catch (error: any) {
        console.error('Error updating schedule period:', error);
        throw new Error(error.message || 'Failed to update schedule period');
      }
    },

    deleteSchedulePeriod: async (_: unknown, { id }: { id: string }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized - Admin access required');
      }

      if (!validateObjectId(id)) {
        throw new Error('Invalid schedule period ID format');
      }

      try {
        const period = await SchedulePeriod.findByIdAndDelete(id);
        if (!period) {
          throw new Error('Schedule period not found');
        }
        console.log(`Admin ${user.email} deleted schedule period: ${period.name} (ID: ${period._id})`);
        return 'Schedule period deleted successfully';
      } catch (error: any) {
        console.error('Error deleting schedule period:', error);
        throw new Error(error.message || 'Failed to delete schedule period');
      }
    }
  }
}; 