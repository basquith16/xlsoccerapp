import DataLoader from 'dataloader';
import User from '../models/userModel';
import Player from '../models/playerModel';
import Session from '../models/sessionModel';

// User DataLoader - batch load users by IDs
export const createUserLoader = () => new DataLoader(async (userIds: readonly string[]) => {
  const users = await User.find({ _id: { $in: userIds } });
  const userMap = new Map(users.map(user => [user._id.toString(), user]));
  return userIds.map(id => userMap.get(id) || null);
});

// Player DataLoader - batch load players by IDs
export const createPlayerLoader = () => new DataLoader(async (playerIds: readonly string[]) => {
  const players = await Player.find({ _id: { $in: playerIds } });
  const playerMap = new Map(players.map(player => [player._id.toString(), player]));
  return playerIds.map(id => playerMap.get(id) || null);
});

// Session DataLoader - batch load sessions by IDs
export const createSessionLoader = () => new DataLoader(async (sessionIds: readonly string[]) => {
  const sessions = await Session.find({ _id: { $in: sessionIds } });
  const sessionMap = new Map(sessions.map(session => [session._id.toString(), session]));
  return sessionIds.map(id => sessionMap.get(id) || null);
});

// Trainers by Session DataLoader - batch load trainers for multiple sessions
export const createTrainersBySessionLoader = () => new DataLoader(async (sessionIds: readonly string[]) => {
  const sessions = await Session.find({ _id: { $in: sessionIds } }).populate('trainers');
  const sessionTrainersMap = new Map(
    sessions.map(session => [session._id.toString(), session.trainers || []])
  );
  return sessionIds.map(id => sessionTrainersMap.get(id) || []);
});

// Players by Parent DataLoader - batch load family members (players) by parent IDs
export const createPlayersByParentLoader = () => new DataLoader(async (parentIds: readonly string[]) => {
  const players = await Player.find({ parent: { $in: parentIds } });
  const playersByParent = new Map<string, any[]>();
  
  // Initialize empty arrays for all parent IDs
  parentIds.forEach(parentId => {
    playersByParent.set(parentId, []);
  });
  
  // Group players by parent ID
  players.forEach(player => {
    const parentId = player.parent?.toString();
    if (parentId && playersByParent.has(parentId)) {
      playersByParent.get(parentId)!.push(player);
    }
  });
  
  return parentIds.map(id => playersByParent.get(id) || []);
});

// Create all loaders - call this in your GraphQL context
export const createDataLoaders = () => ({
  userLoader: createUserLoader(),
  playerLoader: createPlayerLoader(),
  sessionLoader: createSessionLoader(),
  trainersBySessionLoader: createTrainersBySessionLoader(),
  playersByParentLoader: createPlayersByParentLoader(),
});