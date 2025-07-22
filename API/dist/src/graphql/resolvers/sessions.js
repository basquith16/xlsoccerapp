import Session from '../../models/sessionModel';
import Booking from '../../models/bookingModel';
import { validateObjectId } from '../../utils/validation';
export const sessionResolvers = {
    Query: {
        sessions: async (_, { limit = 100, offset = 0 }) => {
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
        adminSessions: async (_, { limit = 100, offset = 0 }, { user }) => {
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
        session: async (_, { id }) => {
            if (!validateObjectId(id)) {
                throw new Error('Invalid session ID format');
            }
            const session = await Session.findById(id).populate('trainers', 'name');
            if (!session) {
                throw new Error('Session not found');
            }
            return session;
        },
        sessionBySlug: async (_, { slug }) => {
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
        createSession: async (_, { input }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            try {
                const session = new Session(input);
                await session.save();
                console.log(`Admin ${user.email} created session: ${session.name} (ID: ${session._id})`);
                return session;
            }
            catch (error) {
                console.error('Error creating session:', error);
                throw new Error(error.message || 'Failed to create session');
            }
        },
        updateSession: async (_, { id, input }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            if (!validateObjectId(id)) {
                throw new Error('Invalid session ID format');
            }
            try {
                const session = await Session.findByIdAndUpdate(id, { ...input, updatedAt: new Date() }, { new: true, runValidators: true });
                if (!session) {
                    throw new Error('Session not found');
                }
                console.log(`Admin ${user.email} updated session: ${session.name} (ID: ${session._id})`);
                return session;
            }
            catch (error) {
                console.error('Error updating session:', error);
                throw new Error(error.message || 'Failed to update session');
            }
        },
        deleteSession: async (_, { id }, { user }) => {
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
            }
            catch (error) {
                console.error('Error deleting session:', error);
                throw new Error(error.message || 'Failed to delete session');
            }
        }
    },
    Session: {
        isActive: (session) => {
            const now = new Date();
            const endDate = new Date(session.endDate);
            return now <= endDate;
        },
        isPubliclyVisible: (session) => {
            const now = new Date();
            const endDate = new Date(session.endDate);
            return now <= endDate;
        },
        endDate: (parent) => {
            if (parent.endDate) {
                return parent.endDate.toISOString ? parent.endDate.toISOString() : parent.endDate;
            }
            if (parent.startDates && parent.startDates.length > 0) {
                const lastStartDate = parent.startDates[parent.startDates.length - 1];
                return lastStartDate.toISOString ? lastStartDate.toISOString() : lastStartDate;
            }
            return new Date().toISOString();
        },
        id: (parent) => parent._id || parent.id,
        birthYear: (parent) => parent.birthYear || null,
        images: (parent) => parent.image || [],
        coverImage: (parent) => parent.image && parent.image.length > 0 ? parent.image[0] : null,
        availableSpots: async (parent) => {
            const bookingCount = await Booking.countDocuments({ session: parent._id });
            return Math.max(0, parent.rosterLimit - bookingCount);
        },
        trainer: (parent) => {
            if (parent.trainers && Array.isArray(parent.trainers) && parent.trainers.length > 0) {
                const firstTrainer = parent.trainers.find((trainer) => {
                    if (typeof trainer === 'object' && trainer.name) {
                        return !trainer.name.toLowerCase().includes('admin') &&
                            !trainer.name.toLowerCase().includes('test');
                    }
                    return false;
                });
                if (firstTrainer && typeof firstTrainer === 'object' && firstTrainer.name) {
                    return firstTrainer.name;
                }
            }
            return null;
        },
        startDates: (parent) => {
            if (!parent.startDates || !Array.isArray(parent.startDates)) {
                return [];
            }
            return parent.startDates.map((date) => {
                if (date instanceof Date) {
                    return date.toISOString();
                }
                if (typeof date === 'string') {
                    return date;
                }
                return new Date(date).toISOString();
            });
        },
        createdAt: (parent) => {
            if (parent.createdAt) {
                return parent.createdAt.toISOString ? parent.createdAt.toISOString() : parent.createdAt;
            }
            if (parent.startDates && parent.startDates.length > 0) {
                const firstStartDate = parent.startDates[0];
                return firstStartDate.toISOString ? firstStartDate.toISOString() : firstStartDate;
            }
            return new Date().toISOString();
        },
        updatedAt: (parent) => {
            if (parent.updatedAt) {
                return parent.updatedAt.toISOString ? parent.updatedAt.toISOString() : parent.updatedAt;
            }
            if (parent.startDates && parent.startDates.length > 0) {
                const lastStartDate = parent.startDates[parent.startDates.length - 1];
                return lastStartDate.toISOString ? lastStartDate.toISOString() : lastStartDate;
            }
            return new Date().toISOString();
        }
    },
    SessionSummary: {
        endDate: (parent) => {
            if (parent.endDate) {
                return parent.endDate.toISOString ? parent.endDate.toISOString() : parent.endDate;
            }
            if (parent.startDates && parent.startDates.length > 0) {
                const lastStartDate = parent.startDates[parent.startDates.length - 1];
                return lastStartDate.toISOString ? lastStartDate.toISOString() : lastStartDate;
            }
            return new Date().toISOString();
        },
        id: (parent) => parent._id || parent.id,
        birthYear: (parent) => parent.birthYear || null,
        images: (parent) => parent.image || [],
        coverImage: (parent) => parent.image && parent.image.length > 0 ? parent.image[0] : null,
        availableSpots: async (parent) => {
            const bookingCount = await Booking.countDocuments({ session: parent._id });
            return Math.max(0, parent.rosterLimit - bookingCount);
        },
        trainer: (parent) => {
            if (parent.trainers && Array.isArray(parent.trainers) && parent.trainers.length > 0) {
                const firstTrainer = parent.trainers.find((trainer) => {
                    if (typeof trainer === 'object' && trainer.name) {
                        return !trainer.name.toLowerCase().includes('admin') &&
                            !trainer.name.toLowerCase().includes('test');
                    }
                    return false;
                });
                if (firstTrainer && typeof firstTrainer === 'object' && firstTrainer.name) {
                    return firstTrainer.name;
                }
            }
            return null;
        },
        startDates: (parent) => {
            if (!parent.startDates || !Array.isArray(parent.startDates)) {
                return [];
            }
            return parent.startDates.map((date) => {
                if (date instanceof Date) {
                    return date.toISOString();
                }
                if (typeof date === 'string') {
                    return date;
                }
                return new Date(date).toISOString();
            });
        },
        createdAt: (parent) => {
            if (parent.createdAt) {
                return parent.createdAt.toISOString ? parent.createdAt.toISOString() : parent.createdAt;
            }
            if (parent.startDates && parent.startDates.length > 0) {
                const firstStartDate = parent.startDates[0];
                return firstStartDate.toISOString ? firstStartDate.toISOString() : firstStartDate;
            }
            return new Date().toISOString();
        },
        updatedAt: (parent) => {
            if (parent.updatedAt) {
                return parent.updatedAt.toISOString ? parent.updatedAt.toISOString() : parent.updatedAt;
            }
            if (parent.startDates && parent.startDates.length > 0) {
                const lastStartDate = parent.startDates[parent.startDates.length - 1];
                return lastStartDate.toISOString ? lastStartDate.toISOString() : lastStartDate;
            }
            return new Date().toISOString();
        }
    }
};
