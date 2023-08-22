const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const playerRouter = require('./playerRoutes');



// Mounting player router to automatially add them to current logged in user
router.use('/:userId/players', playerRouter);

// Routes
router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.get('/logout', authController.logout)

// Password reset/update
router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)


// Everything below here is AUTH protected
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword)

// User controlled updates/queries
router.get('/myAccount', userController.getMe, userController.getUser)
router.patch('/updateMyAccount', userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe)
router.delete('/deleteMyAccount', userController.deleteMe)

router.route('/')
    .get(userController.getAllUsers)

router.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;