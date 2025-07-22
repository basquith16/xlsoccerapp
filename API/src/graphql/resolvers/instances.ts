import SessionInstance from '../../models/sessionInstanceModel';
import SchedulePeriod from '../../models/schedulePeriodModel';
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
  if (plain.date) {
    plain.date = new Date(plain.date).toISOString();
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
  
  // Map periodInfo to period field for GraphQL
  if (plain.periodInfo) {
    plain.period = plain.periodInfo;
    delete plain.periodInfo;
  } else {
    // If periodInfo is null/undefined, provide a default period object
    plain.period = {
      id: plain.period || 'unknown',
      name: 'Unknown Period',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      capacity: 0
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
  
  // Calculate virtual properties if they're missing
  const now = new Date();
  const instanceDate = new Date(plain.date);
  
  if (plain.isUpcoming === undefined) {
    plain.isUpcoming = instanceDate > now;
  }
  
  if (plain.isPast === undefined) {
    plain.isPast = instanceDate < now;
  }
  
  if (plain.isToday === undefined) {
    const today = new Date();
    plain.isToday = instanceDate.toDateString() === today.toDateString();
  }
  
  if (plain.isThisWeek === undefined) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    plain.isThisWeek = instanceDate >= weekStart && instanceDate <= weekEnd;
  }
  
  if (plain.isThisMonth === undefined) {
    plain.isThisMonth = instanceDate.getMonth() === now.getMonth() && 
                       instanceDate.getFullYear() === now.getFullYear();
  }
  
  if (plain.availableSpots === undefined) {
    plain.availableSpots = Math.max(0, (plain.capacity || 0) - (plain.bookedCount || 0));
  }
  
  if (plain.isFull === undefined) {
    plain.isFull = (plain.bookedCount || 0) >= (plain.capacity || 0);
  }
  
  if (plain.isAvailable === undefined) {
    plain.isAvailable = plain.isActive && !plain.isCancelled && !plain.isFull;
  }
  
  if (plain.bookingPercentage === undefined) {
    const capacity = plain.capacity || 1;
    const booked = plain.bookedCount || 0;
    plain.bookingPercentage = Math.round((booked / capacity) * 100);
  }
  
  return plain;
};

const convertArrayToPlainObjects = (docs: any[]) => {
  return docs.map(convertToPlainObject);
};

export const instanceResolvers = {
  Query: {
    sessionInstances: async (_: unknown, { limit = 10, offset = 0 }: { limit?: number; offset?: number }) => {
      const instances = await SessionInstance.find({ isActive: true })
        .populate('templateInfo')
        .populate('periodInfo')
        .populate('coaches')
        .limit(limit)
        .skip(offset);
      
      const totalCount = await SessionInstance.countDocuments({ isActive: true });
      const hasNextPage = offset + limit < totalCount;
      
      return {
        nodes: convertArrayToPlainObjects(instances),
        totalCount,
        hasNextPage
      };
    },

    sessionInstance: async (_: unknown, { id }: { id: string }) => {
      if (!validateObjectId(id)) {
        throw new Error('Invalid instance ID');
      }

      const instance = await SessionInstance.findById(id)
        .populate('templateInfo')
        .populate('periodInfo')
        .populate('coaches');

      if (!instance) {
        throw new Error('Session instance not found');
      }

      return convertToPlainObject(instance);
    },

    sessionInstancesByPeriod: async (_: unknown, { periodId, limit = 10, offset = 0 }: { periodId: string; limit?: number; offset?: number }) => {
      if (!validateObjectId(periodId)) {
        throw new Error('Invalid period ID');
      }

      const instances = await SessionInstance.find({ period: periodId, isActive: true })
        .populate('templateInfo')
        .populate('periodInfo')
        .populate('coaches')
        .limit(limit)
        .skip(offset);
      
      const totalCount = await SessionInstance.countDocuments({ period: periodId, isActive: true });
      const hasNextPage = offset + limit < totalCount;
      
      return {
        nodes: convertArrayToPlainObjects(instances),
        totalCount,
        hasNextPage
      };
    },

    sessionInstancesByTemplate: async (_: unknown, { templateId, limit = 10, offset = 0 }: { templateId: string; limit?: number; offset?: number }) => {
      if (!validateObjectId(templateId)) {
        throw new Error('Invalid template ID');
      }

      const instances = await SessionInstance.find({ template: templateId, isActive: true })
        .populate('templateInfo')
        .populate('periodInfo')
        .populate('coaches')
        .limit(limit)
        .skip(offset);
      
      const totalCount = await SessionInstance.countDocuments({ template: templateId, isActive: true });
      const hasNextPage = offset + limit < totalCount;
      
      return {
        nodes: convertArrayToPlainObjects(instances),
        totalCount,
        hasNextPage
      };
    },

    adminSessionInstances: async (_: unknown, { limit = 10, offset = 0 }: { limit?: number; offset?: number }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized - Admin access required');
      }
      
      const instances = await SessionInstance.find({})
        .populate('templateInfo')
        .populate('periodInfo')
        .populate('coaches')
        .limit(limit)
        .skip(offset);
      
      const totalCount = await SessionInstance.countDocuments({});
      const hasNextPage = offset + limit < totalCount;
      
      return {
        nodes: convertArrayToPlainObjects(instances),
        totalCount,
        hasNextPage
      };
    }
  },

  Mutation: {
    createSessionInstance: async (_: unknown, { input }: { input: any }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized - Admin access required');
      }

      try {
        const instance = new SessionInstance(input);
        const savedInstance = await instance.save();
        console.log(`Admin ${user.email} created session instance: ${savedInstance.name} (ID: ${savedInstance._id})`);
        return savedInstance;
      } catch (error: any) {
        console.error('Error creating session instance:', error);
        throw new Error(error.message || 'Failed to create session instance');
      }
    },

    updateSessionInstance: async (_: unknown, { id, input }: { id: string; input: any }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized - Admin access required');
      }

      if (!validateObjectId(id)) {
        throw new Error('Invalid session instance ID format');
      }

      try {
        const instance = await SessionInstance.findByIdAndUpdate(id, input, { new: true });
        if (!instance) {
          throw new Error('Session instance not found');
        }
        console.log(`Admin ${user.email} updated session instance: ${instance.name} (ID: ${instance._id})`);
        return instance;
      } catch (error: any) {
        console.error('Error updating session instance:', error);
        throw new Error(error.message || 'Failed to update session instance');
      }
    },

    deleteSessionInstance: async (_: unknown, { id }: { id: string }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized - Admin access required');
      }

      if (!validateObjectId(id)) {
        throw new Error('Invalid session instance ID format');
      }

      try {
        const instance = await SessionInstance.findByIdAndDelete(id);
        if (!instance) {
          throw new Error('Session instance not found');
        }
        console.log(`Admin ${user.email} deleted session instance: ${instance.name} (ID: ${instance._id})`);
        return 'Session instance deleted successfully';
      } catch (error: any) {
        console.error('Error deleting session instance:', error);
        throw new Error(error.message || 'Failed to delete session instance');
      }
    },

    generateInstancesFromPeriod: async (_: unknown, { periodId, startDate, endDate, daysOfWeek, startTime, endTime }: { periodId: string; startDate: string; endDate: string; daysOfWeek: number[]; startTime: string; endTime: string }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized - Admin access required');
      }

      if (!validateObjectId(periodId)) {
        throw new Error('Invalid period ID format');
      }

      try {
        const period = await SchedulePeriod.findById(periodId).populate('template');
        if (!period) {
          throw new Error('Schedule period not found');
        }

        const template = period.template as any;
        if (!template) {
          throw new Error('Template not found for this period');
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          throw new Error('Invalid date format');
        }
        if (start >= end) {
          throw new Error('Start date must be before end date');
        }

        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
          throw new Error('Invalid time format. Use HH:MM format');
        }

        const validDays = daysOfWeek.every(day => day >= 0 && day <= 6);
        if (!validDays || daysOfWeek.length === 0) {
          throw new Error('Invalid days of week. Must be 0-6 (Sunday-Saturday)');
        }

        const instances: any[] = [];
        const currentDate = new Date(start);
        
        while (currentDate <= end) {
          const dayOfWeek = currentDate.getDay();
          
          if (daysOfWeek.includes(dayOfWeek)) {
            const instance = new SessionInstance({
              period: periodId,
              template: template._id,
              name: `${template.name} - ${currentDate.toLocaleDateString()}`,
              date: new Date(currentDate),
              startTime,
              endTime,
              coaches: period.coaches,
              capacity: period.capacity,
              isActive: true
            });

            instances.push(instance);
          }
          
          currentDate.setDate(currentDate.getDate() + 1);
        }

        const savedInstances = await SessionInstance.insertMany(instances);
        
        console.log(`Admin ${user.email} generated ${savedInstances.length} session instances from period: ${period.name} (ID: ${period._id})`);
        
        return savedInstances;
      } catch (error: any) {
        console.error('Error generating instances from period:', error);
        throw new Error(error.message || 'Failed to generate instances from period');
      }
    }
  }
}; 