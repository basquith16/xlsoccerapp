const express = require('express');
const playerController = require('../controllers/playerController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');


const router = express.Router({ mergeParams: true });

// Everything below here is AUTH protected
router.use(authController.protect);

// Routes
router.route('/')
    .get(playerController.getAllPlayers)
    .post(playerController.setSessionUserIds, playerController.addPlayer);

// Everything below here is restricted to admin and users
router.use(authController.restrictTo('admin', 'user'));
    
router.route('/:id')
    .get(playerController.getPlayer)
    .patch(playerController.updatePlayer)
    .delete(playerController.deletePlayer);

module.exports = router;