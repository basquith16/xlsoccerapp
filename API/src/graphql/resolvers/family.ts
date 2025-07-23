import Player from '../../models/playerModel';
import User from '../../models/userModel';
import { validateObjectId, sanitizeInput } from '../../utils/validation';
import { IUser } from '../../types/models';
import { AuthContext } from '../../types/context';
import { requireAdmin, requireAuth } from '../../utils/authMiddleware';

export const familyResolvers = {
  Query: {
    familyMembers: async (_: unknown, __: unknown, { user }: { user: IUser | null }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      const players = await Player.find({ parent: user._id });
      return players;
    },

    players: async (_: unknown, { limit = 50, offset = 0 }: { limit?: number; offset?: number }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized - Admin access required');
      }
      
      const players = await Player.find({})
        .populate('parent', 'name email')
        .limit(limit)
        .skip(offset)
        .sort({ createdAt: -1 });
      
      const totalCount = await Player.countDocuments({});
      const hasNextPage = offset + limit < totalCount;
      
      return {
        nodes: players,
        totalCount,
        hasNextPage
      };
    },

    adminPlayers: async (_: unknown, { limit = 50, offset = 0 }: { limit?: number; offset?: number }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized - Admin access required');
      }
      
      const players = await Player.find({})
        .populate('parent', 'name email role')
        .limit(limit)
        .skip(offset)
        .sort({ createdAt: -1 });
      
      const totalCount = await Player.countDocuments({});
      const hasNextPage = offset + limit < totalCount;
      
      return {
        nodes: players,
        totalCount,
        hasNextPage
      };
    },

    player: async (_: unknown, { id }: { id: string }) => {
      if (!validateObjectId(id)) {
        throw new Error('Invalid player ID format');
      }
      const player = await Player.findById(id);
      if (!player) {
        throw new Error('Player not found');
      }
      return player;
    }
  },

  Mutation: {
    addFamilyMember: async (_: unknown, { input }: { input: any }, { user }: { user: IUser | null }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { name, birthDate, sex, isMinor } = input;

      const player = new Player({
        name,
        birthDate: new Date(birthDate),
        sex,
        parent: user._id,
        isMinor
      });

      await player.save();

      return {
        id: player._id,
        name: player.name,
        isMinor: player.isMinor,
        birthDate: player.birthDate.toISOString(),
        sex: player.sex,
        profImg: player.profImg
      };
    },

    removeFamilyMember: async (_: unknown, { memberId }: { memberId: string }, { user }: { user: IUser | null }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      if (!validateObjectId(memberId)) {
        throw new Error('Invalid member ID format');
      }

      const player = await Player.findOne({ _id: memberId, parent: user._id });
      if (!player) {
        throw new Error('Family member not found');
      }

      await Player.findByIdAndDelete(memberId);

      return 'Family member removed successfully';
    },

    // Admin mutations
    createPlayer: async (_: unknown, { input }: { input: any }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized - Admin access required');
      }

      const { name, birthDate, sex, waiverSigned, profImg, parentId } = input;

      // Validate required fields
      if (!name || !birthDate || !sex || !parentId) {
        throw new Error('Name, birth date, sex, and parent ID are required');
      }

      // Validate parent exists
      if (!validateObjectId(parentId)) {
        throw new Error('Invalid parent ID format');
      }

      const parent = await User.findById(parentId);
      if (!parent) {
        throw new Error('Parent user not found');
      }

      // Calculate if minor (under 18)
      const birthDateObj = new Date(birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDateObj.getFullYear();
      const monthDiff = today.getMonth() - birthDateObj.getMonth();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate()) ? age - 1 : age;
      const isMinor = actualAge < 18;

      const player = new Player({
        name: sanitizeInput(name),
        birthDate: birthDateObj,
        sex,
        waiverSigned: waiverSigned || false,
        isMinor,
        profImg: profImg || 'default.jpg',
        parent: parentId
      });

      await player.save();
      await player.populate('parent', 'name email');

      return player;
    },

    updatePlayer: async (_: unknown, { id, input }: { id: string; input: any }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized - Admin access required');
      }

      if (!validateObjectId(id)) {
        throw new Error('Invalid player ID format');
      }

      const player = await Player.findById(id);
      if (!player) {
        throw new Error('Player not found');
      }

      const { name, birthDate, sex, waiverSigned, profImg, parentId } = input;
      const updateData: any = {};

      if (name !== undefined) {
        updateData.name = sanitizeInput(name);
      }

      if (birthDate !== undefined) {
        const birthDateObj = new Date(birthDate);
        updateData.birthDate = birthDateObj;
        
        // Recalculate isMinor if birthDate changes
        const today = new Date();
        const age = today.getFullYear() - birthDateObj.getFullYear();
        const monthDiff = today.getMonth() - birthDateObj.getMonth();
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate()) ? age - 1 : age;
        updateData.isMinor = actualAge < 18;
      }

      if (sex !== undefined) {
        updateData.sex = sex;
      }

      if (waiverSigned !== undefined) {
        updateData.waiverSigned = waiverSigned;
      }

      if (profImg !== undefined) {
        updateData.profImg = profImg;
      }

      if (parentId !== undefined) {
        if (!validateObjectId(parentId)) {
          throw new Error('Invalid parent ID format');
        }
        
        const parent = await User.findById(parentId);
        if (!parent) {
          throw new Error('Parent user not found');
        }
        
        updateData.parent = parentId;
      }

      const updatedPlayer = await Player.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('parent', 'name email');

      return updatedPlayer;
    },

    deletePlayer: async (_: unknown, { id }: { id: string }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized - Admin access required');
      }

      if (!validateObjectId(id)) {
        throw new Error('Invalid player ID format');
      }

      const player = await Player.findById(id);
      if (!player) {
        throw new Error('Player not found');
      }

      await Player.findByIdAndDelete(id);

      return 'Player deleted successfully';
    }
  },

  Player: {
    id: (parent: any) => parent._id || parent.id,
    birthDate: (parent: any) => parent.birthDate?.toISOString ? parent.birthDate.toISOString() : parent.birthDate,
    parent: async (parent: any, _: unknown, { loaders }: AuthContext) => {
      if (parent.parent && typeof parent.parent === 'object' && parent.parent._id) {
        return parent.parent;
      }
      
      if (parent.parent && typeof parent.parent === 'string') {
        return await loaders.userLoader.load(parent.parent);
      }
      
      return null;
    }
  }
}; 