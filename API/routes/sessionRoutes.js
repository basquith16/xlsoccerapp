const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const authController = require('../controllers/authController');


// Everything below here is AUTH protected
router.use(authController.protect);

// Routes
router.route('/')
    .get(sessionController.getAllSessions);

    
// Everything below here is restricted to admin
router.use(authController.restrictTo('admin'));

router.route('/')
    .post(sessionController.addSession);

router.route('/:id')
    .get(sessionController.getSession)
    .patch(sessionController.uploadSessionPhotos, sessionController.resizeSessionPhotos, sessionController.updateSession)
    .delete(sessionController.deleteSession);

module.exports = router;


// Not useful for this app
// router.route('/top-5-cheap')
//     .get(sessionController.aliasTopSessions, sessionController.getAllSessions);
// router.route('/session-stats')
//     .get(sessionController.getSessionStats);
// router.route('/monthly-plan/:year')
// .get(sessionController.getMonthlyPlan);

 