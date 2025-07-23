import User from '../../models/userModel';
import { validateObjectId, sanitizeInput } from '../../utils/validation';
import { IUser } from '../../types/models';

export const userResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, { user }: { user: IUser | null }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      return user;
    },

    users: async (_: unknown, __: unknown, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized');
      }
      return await User.find({});
    }
  },

  Mutation: {
    updateMe: async (_: unknown, { input }: { input: any }, { user }: { user: IUser | null }) => {
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

      const updateData: any = {};
      if (name) {
        updateData.name = sanitizeInput(name);
      }
      if (email) {
        updateData.email = email.toLowerCase().trim();
      }
      if (photo !== undefined) {
        updateData.photo = photo;
      }

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        throw new Error('Failed to update user');
      }

      return updatedUser;
    },

    updateUser: async (_: unknown, { id, input }: { id: string; input: any }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized - Admin access required');
      }

      if (!validateObjectId(id)) {
        throw new Error('Invalid user ID format');
      }

      try {
        const updatedUser = await User.findByIdAndUpdate(
          id,
          { ...input, updatedAt: new Date() },
          { new: true, runValidators: true }
        );

        if (!updatedUser) {
          throw new Error('User not found');
        }

        console.log(`Admin ${user.email} updated user: ${updatedUser.email} (ID: ${updatedUser._id})`);
        
        return updatedUser;
      } catch (error: any) {
        console.error('Error updating user:', error);
        throw new Error(error.message || 'Failed to update user');
      }
    },

    deleteUser: async (_: unknown, { id }: { id: string }, { user }: { user: IUser | null }) => {
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
      } catch (error: any) {
        console.error('Error deleting user:', error);
        throw new Error(error.message || 'Failed to delete user');
      }
    }
  },

  User: {
    id: (parent: any) => parent._id || parent.id,
    birthday: (parent: any) => parent.birthday?.toISOString ? parent.birthday.toISOString() : parent.birthday,
  }
}; 