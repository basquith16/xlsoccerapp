import SessionInstance from '../../models/sessionInstanceModel';
import SchedulePeriod from '../../models/schedulePeriodModel';
import { validateObjectId } from '../../utils/validation';
export const instanceResolvers = {
    Query: {
        sessionInstances: async (_, { limit = 10, offset = 0 }) => {
            const instances = await SessionInstance.find({ isActive: true })
                .populate('templateInfo')
                .populate('periodInfo')
                .populate('coachInfo')
                .limit(limit)
                .skip(offset);
            const totalCount = await SessionInstance.countDocuments({ isActive: true });
            const hasNextPage = offset + limit < totalCount;
            return {
                nodes: instances,
                totalCount,
                hasNextPage
            };
        },
        sessionInstance: async (_, { id }) => {
            if (!validateObjectId(id)) {
                throw new Error('Invalid instance ID');
            }
            const instance = await SessionInstance.findById(id)
                .populate('templateInfo')
                .populate('periodInfo')
                .populate('coachInfo');
            if (!instance) {
                throw new Error('Session instance not found');
            }
            return instance;
        },
        sessionInstancesByPeriod: async (_, { periodId, limit = 10, offset = 0 }) => {
            if (!validateObjectId(periodId)) {
                throw new Error('Invalid period ID');
            }
            const instances = await SessionInstance.find({ period: periodId, isActive: true })
                .populate('templateInfo')
                .populate('periodInfo')
                .populate('coachInfo')
                .limit(limit)
                .skip(offset);
            const totalCount = await SessionInstance.countDocuments({ period: periodId, isActive: true });
            const hasNextPage = offset + limit < totalCount;
            return {
                nodes: instances,
                totalCount,
                hasNextPage
            };
        },
        sessionInstancesByTemplate: async (_, { templateId, limit = 10, offset = 0 }) => {
            if (!validateObjectId(templateId)) {
                throw new Error('Invalid template ID');
            }
            const instances = await SessionInstance.find({ template: templateId, isActive: true })
                .populate('templateInfo')
                .populate('periodInfo')
                .populate('coachInfo')
                .limit(limit)
                .skip(offset);
            const totalCount = await SessionInstance.countDocuments({ template: templateId, isActive: true });
            const hasNextPage = offset + limit < totalCount;
            return {
                nodes: instances,
                totalCount,
                hasNextPage
            };
        },
        adminSessionInstances: async (_, { limit = 10, offset = 0 }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            const instances = await SessionInstance.find({})
                .populate('templateInfo')
                .populate('periodInfo')
                .populate('coachInfo')
                .limit(limit)
                .skip(offset);
            const totalCount = await SessionInstance.countDocuments({});
            const hasNextPage = offset + limit < totalCount;
            return {
                nodes: instances,
                totalCount,
                hasNextPage
            };
        }
    },
    Mutation: {
        createSessionInstance: async (_, { input }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            try {
                const instance = new SessionInstance(input);
                const savedInstance = await instance.save();
                console.log(`Admin ${user.email} created session instance: ${savedInstance.name} (ID: ${savedInstance._id})`);
                return savedInstance;
            }
            catch (error) {
                console.error('Error creating session instance:', error);
                throw new Error(error.message || 'Failed to create session instance');
            }
        },
        updateSessionInstance: async (_, { id, input }, { user }) => {
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
            }
            catch (error) {
                console.error('Error updating session instance:', error);
                throw new Error(error.message || 'Failed to update session instance');
            }
        },
        deleteSessionInstance: async (_, { id }, { user }) => {
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
            }
            catch (error) {
                console.error('Error deleting session instance:', error);
                throw new Error(error.message || 'Failed to delete session instance');
            }
        },
        generateInstancesFromPeriod: async (_, { periodId, startDate, endDate, daysOfWeek, startTime, endTime }, { user }) => {
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
                const template = period.template;
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
                const instances = [];
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
            }
            catch (error) {
                console.error('Error generating instances from period:', error);
                throw new Error(error.message || 'Failed to generate instances from period');
            }
        }
    }
};
