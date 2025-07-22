import SchedulePeriod from '../../models/schedulePeriodModel';
import User from '../../models/userModel';
import { validateObjectId } from '../../utils/validation';
export const periodResolvers = {
    Query: {
        schedulePeriods: async (_, { limit = 10, offset = 0 }) => {
            const periods = await SchedulePeriod.find({ isActive: true })
                .populate('templateInfo')
                .populate('instances')
                .limit(limit)
                .skip(offset);
            const totalCount = await SchedulePeriod.countDocuments({ isActive: true });
            const hasNextPage = offset + limit < totalCount;
            return {
                nodes: periods,
                totalCount,
                hasNextPage
            };
        },
        schedulePeriod: async (_, { id }) => {
            if (!validateObjectId(id)) {
                throw new Error('Invalid period ID');
            }
            const period = await SchedulePeriod.findById(id)
                .populate('templateInfo')
                .populate('instances');
            if (!period) {
                throw new Error('Schedule period not found');
            }
            return period;
        },
        schedulePeriodsByTemplate: async (_, { templateId, limit = 10, offset = 0 }) => {
            if (!validateObjectId(templateId)) {
                throw new Error('Invalid template ID');
            }
            const periods = await SchedulePeriod.find({ template: templateId, isActive: true })
                .populate('templateInfo')
                .populate('instances')
                .limit(limit)
                .skip(offset);
            const totalCount = await SchedulePeriod.countDocuments({ template: templateId, isActive: true });
            const hasNextPage = offset + limit < totalCount;
            return {
                nodes: periods,
                totalCount,
                hasNextPage
            };
        },
        adminSchedulePeriods: async (_, { limit = 10, offset = 0 }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            const periods = await SchedulePeriod.find({})
                .populate('templateInfo')
                .populate('instances')
                .limit(limit)
                .skip(offset);
            const totalCount = await SchedulePeriod.countDocuments({});
            const hasNextPage = offset + limit < totalCount;
            return {
                nodes: periods,
                totalCount,
                hasNextPage
            };
        },
        adminCoaches: async (_, __, { user }) => {
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
                return coaches;
            }
            catch (error) {
                console.error('Error fetching coaches:', error);
                throw new Error('Failed to fetch coaches');
            }
        }
    },
    Mutation: {
        createSchedulePeriod: async (_, { input }, { user }) => {
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
            }
            catch (error) {
                console.error('Error creating schedule period:', error);
                throw new Error(error.message || 'Failed to create schedule period');
            }
        },
        updateSchedulePeriod: async (_, { id, input }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            if (!validateObjectId(id)) {
                throw new Error('Invalid schedule period ID format');
            }
            try {
                const updateData = {};
                if (input.name !== undefined)
                    updateData.name = input.name;
                if (input.startDate !== undefined)
                    updateData.startDate = input.startDate;
                if (input.endDate !== undefined)
                    updateData.endDate = input.endDate;
                if (input.coachIds !== undefined)
                    updateData.coaches = input.coachIds.filter(id => id !== 'TBD');
                if (input.capacity !== undefined)
                    updateData.capacity = input.capacity;
                if (input.isActive !== undefined)
                    updateData.isActive = input.isActive;
                const period = await SchedulePeriod.findByIdAndUpdate(id, updateData, { new: true });
                if (!period) {
                    throw new Error('Schedule period not found');
                }
                console.log(`Admin ${user.email} updated schedule period: ${period.name} (ID: ${period._id})`);
                return period;
            }
            catch (error) {
                console.error('Error updating schedule period:', error);
                throw new Error(error.message || 'Failed to update schedule period');
            }
        },
        deleteSchedulePeriod: async (_, { id }, { user }) => {
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
            }
            catch (error) {
                console.error('Error deleting schedule period:', error);
                throw new Error(error.message || 'Failed to delete schedule period');
            }
        }
    }
};
