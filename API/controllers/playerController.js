import Player from '../models/playerModel.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from './handlerFactory.js';
// import catchAsync from '../utils/catchAsync';
// import AppError from '../utils/appError';
// import APIFeatures from '../utils/apiFeatures';

export const setSessionUserIds = (req, res, next) => {
    // Allow nested routes
    if (!req.body.session) req.body.session = req.params.sessionId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
};

export const getAllPlayers = getAll(Player);
export const getPlayer = getOne(Player);
export const addPlayer = createOne(Player);
export const updatePlayer = updateOne(Player);
export const deletePlayer = deleteOne(Player);