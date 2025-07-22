import Player from '../../models/playerModel';
import { validateObjectId } from '../../utils/validation';
import { IUser } from '../../types/models';

export const familyResolvers = {
  Query: {
    familyMembers: async (_: unknown, __: unknown, { user }: { user: IUser | null }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      const players = await Player.find({ parent: user._id });
      return players;
    },

    players: async () => {
      return {
        nodes: await Player.find({}),
        totalCount: await Player.countDocuments({})
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
    }
  },

  Player: {
    id: (parent: any) => parent._id || parent.id,
    birthDate: (parent: any) => parent.birthDate?.toISOString ? parent.birthDate.toISOString() : parent.birthDate,
  }
}; 