import User from '../../models/userModel';
import { validateObjectId, sanitizeInput } from '../../utils/validation';
import { IUser } from '../../types/models';
import { AuthContext } from '../../types/context';
import { requireAuth, requireAdmin, protectSensitiveField, requireOwnershipOrAdmin } from '../../utils/authMiddleware';

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
    },

    adminUsers: async (_: unknown, __: unknown, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized - Admin access required');
      }
      
      const users = await User.find({}).sort({ createdAt: -1 });
      const totalCount = await User.countDocuments({});
      
      return {
        nodes: users,
        totalCount,
        hasNextPage: false
      };
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
        const { name, email, photo, role, active, waiverSigned } = input;

        // Validate email if provided
        if (email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
          }

          const existingUser = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: id } });
          if (existingUser) {
            throw new Error('Email is already taken');
          }
        }

        // Validate role if provided
        if (role && !['user', 'coach', 'admin'].includes(role)) {
          throw new Error('Invalid role. Must be user, coach, or admin');
        }

        // Validate photo if provided
        if (photo !== undefined && photo !== null) {
          if (typeof photo !== 'string') {
            throw new Error('Photo must be a string');
          }
          if (!photo.startsWith('http') && !photo.startsWith('/img/')) {
            throw new Error('Invalid photo URL format');
          }
        }

        // Build update data
        const updateData: any = {};
        if (name !== undefined) {
          updateData.name = sanitizeInput(name);
        }
        if (email !== undefined) {
          updateData.email = email.toLowerCase().trim();
        }
        if (photo !== undefined) {
          updateData.photo = photo;
        }
        if (role !== undefined) {
          updateData.role = role;
        }
        if (active !== undefined) {
          updateData.active = active;
        }
        if (waiverSigned !== undefined) {
          updateData.waiverSigned = waiverSigned;
        }

        const updatedUser = await User.findByIdAndUpdate(
          id,
          { ...updateData, updatedAt: new Date() },
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

        // Prevent deletion of the TBD coach (system default)
        if (userToDelete.email === 'tbd@system.local') {
          throw new Error('Cannot delete the TBD coach - this is a system default user');
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
    name: (parent: any) => parent.name,
    // Email is sensitive - only show to admin or user themselves
    email: protectSensitiveField(['admin'])((parent: any, _: unknown, context: AuthContext) => {
      // Admin can see all emails
      if (context.user?.role === 'admin') {
        return parent.email;
      }
      // Users can see their own email
      if (context.user && parent._id.toString() === context.user._id.toString()) {
        return parent.email;
      }
      return null;
    }),
    role: (parent: any) => parent.role,
    photo: (parent: any) => parent.photo,
    waiverSigned: (parent: any) => parent.waiverSigned,
    active: (parent: any) => parent.active,
    birthday: protectSensitiveField(['admin'])((parent: any, _: unknown, context: AuthContext) => {
      // Admin can see all birthdays
      if (context.user?.role === 'admin') {
        return parent.birthday?.toISOString ? parent.birthday.toISOString() : parent.birthday;
      }
      // Users can see their own birthday
      if (context.user && parent._id.toString() === context.user._id.toString()) {
        return parent.birthday?.toISOString ? parent.birthday.toISOString() : parent.birthday;
      }
      return null;
    }),
    joinedDate: (parent: any) => parent.joinedDate?.toISOString ? parent.joinedDate.toISOString() : parent.joinedDate,
    // Family members - only visible to user themselves or admin
    familyMembers: requireOwnershipOrAdmin(async (parent: any, _: unknown, context: AuthContext) => {
      return await context.loaders.playersByParentLoader.load(parent._id.toString());
    })
  }
}; 