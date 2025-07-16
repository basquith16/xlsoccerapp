import express from 'express';
import { getAllSessions, addSession, getSession, getSessionBySlug, updateSession, deleteSession, uploadSessionPhotos, resizeSessionPhotos } from '../controllers/sessionController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

// Public routes (no authentication required)
router.route('/')
    .get(getAllSessions);

router.route('/slug/:slug')
    .get(getSessionBySlug);

// Everything below here is AUTH protected
router.use(protect);

// Everything below here is restricted to admin
router.use(restrictTo('admin'));

router.route('/')
    .post(addSession);

router.route('/:id')
    .get(getSession)
    .patch(uploadSessionPhotos, resizeSessionPhotos, updateSession)
    .delete(deleteSession);

export default router;

// Not useful for this app
// router.route('/top-5-cheap')
//     .get(sessionController.aliasTopSessions, sessionController.getAllSessions);
// router.route('/session-stats')
//     .get(sessionController.getSessionStats);
// router.route('/monthly-plan/:year')
// .get(sessionController.getMonthlyPlan);

 