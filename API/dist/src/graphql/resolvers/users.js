import User from '../../models/userModel';
import { validateObjectId, sanitizeInput } from '../../utils/validation';
export const userResolvers = {
    Query: {
        me: async (_, __, { user }) => {
            if (!user) {
                throw new Error('Not authenticated');
            }
            return user;
        },
        users: async (_, __, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized');
            }
            return await User.find({});
        }
    },
    Mutation: {
        updateMe: async (_, { input }, { user }) => {
            if (!user) {
                throw new Error('Not authenticated');
            }
            const { name, email, photo } = input;
            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    throw new Error('Invalid email format');
                }
                const existingUser = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: user._id } });
                if (existingUser) {
                    throw new Error('Email is already taken');
                }
            }
            if (photo !== undefined && photo !== null) {
                if (typeof photo !== 'string') {
                    throw new Error('Photo must be a string');
                }
                if (!photo.startsWith('http') && !photo.startsWith('/img/')) {
                    throw new Error('Invalid photo URL format');
                }
            }
            const updateData = {};
            if (name) {
                updateData.name = sanitizeInput(name);
            }
            if (email) {
                updateData.email = email.toLowerCase().trim();
            }
            if (photo !== undefined) {
                updateData.photo = photo;
            }
            const updatedUser = await User.findByIdAndUpdate(user._id, updateData, { new: true, runValidators: true });
            if (!updatedUser) {
                throw new Error('Failed to update user');
            }
            return updatedUser;
        },
        updateUser: async (_, { id, input }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            if (!validateObjectId(id)) {
                throw new Error('Invalid user ID format');
            }
            try {
                const updatedUser = await User.findByIdAndUpdate(id, { ...input, updatedAt: new Date() }, { new: true, runValidators: true });
                if (!updatedUser) {
                    throw new Error('User not found');
                }
                console.log(`Admin ${user.email} updated user: ${updatedUser.email} (ID: ${updatedUser._id})`);
                return updatedUser;
            }
            catch (error) {
                console.error('Error updating user:', error);
                throw new Error(error.message || 'Failed to update user');
            }
        },
        deleteUser: async (_, { id }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            if (!validateObjectId(id)) {
                throw new Error('Invalid user ID format');
            }
            try {
                const userToDelete = await User.findById(id);
                if (!userToDelete) {
                    throw new Error('User not found');
                }
                if (userToDelete._id.toString() === user._id.toString()) {
                    throw new Error('Cannot delete your own account');
                }
                await User.findByIdAndDelete(id);
                console.log(`Admin ${user.email} deleted user: ${userToDelete.email} (ID: ${userToDelete._id})`);
                return 'User deleted successfully';
            }
            catch (error) {
                console.error('Error deleting user:', error);
                throw new Error(error.message || 'Failed to delete user');
            }
        }
    },
    User: {
        id: (parent) => parent._id || parent.id,
        birthday: (parent) => parent.birthday?.toISOString ? parent.birthday.toISOString() : parent.birthday,
    }
};
