const Player = require('../models/playerModel');
const factory = require('./handlerFactory');
// const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
// const APIFeatures = require('../utils/apiFeatures');

exports.setSessionUserIds = (req, res, next) => {
    // Allow nested routes
    if(!req.body.account) req.body.account = req.params.userId;
    if(!req.body.teams) req.body.teams = req.params.teamsId;

    console.log(req.body.account);

    next();
}

exports.getAllPlayers = factory.getAll(Player);
exports.getPlayer = factory.getOne(Player);
exports.addPlayer = factory.createOne(Player);
exports.updatePlayer = factory.updateOne(Player);
exports.deletePlayer = factory.deleteOne(Player);