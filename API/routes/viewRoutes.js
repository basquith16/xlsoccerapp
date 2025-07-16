import express from 'express';
import viewController from '../controllers/viewsController.js';
import authController from '../controllers/authController.js';
import bookingController from '../controllers/bookingController.js';

const router = express.Router();

router.use(authController.isLoggedIn);

router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/session/:slug', authController.isLoggedIn, viewController.getSession);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/me', authController.protect, viewController.getAccount);

router.get('/my-sessions', authController.protect, bookingController.createBookingCheckout);

router.post('/submit-user-data', authController.protect, viewController.updateUserData);

export default router;