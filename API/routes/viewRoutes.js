const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
const router = express.Router();


router.get('/', authController.isLoggedIn, viewsController.getHomepage);
router.get('/login', authController.isLoggedIn, viewsController.getLogin);
router.get('/register', viewsController.getRegistration);
router.get('/sessions', authController.isLoggedIn, viewsController.getSessions);
router.get('/session/:slug', authController.isLoggedIn, viewsController.getSession);
router.get('/myaccount', authController.protect, viewsController.myAccount);
router.get('/myaccount/sessions', authController.protect, viewsController.getMySessions);
router.get('/myaccount/players', authController.protect, viewsController.getMyPlayers);
router.get('/myaccount/billing', authController.protect, viewsController.getMyInvoices);
router.get('/myaccount/admin/sessions', authController.protect, viewsController.getAdminSessions);
router.get('/myaccount/admin/users', authController.protect, viewsController.getAdminUsers);
router.get('/myaccount/admin/players', authController.protect, viewsController.getAdminPlayers);
router.get('/myaccount/admin/user', authController.protect, viewsController.getSingleUser);
router.get('/thank-you', authController.protect, viewsController.getThankYou, bookingController.createBookingCheckout);

module.exports = router;