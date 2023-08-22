const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);
router.get('/checkout/:sessionId', bookingController.getCheckout);


router.use(authController.restrictTo('admin', 'coach'));

router
.route('/')
.get(bookingController.getAllBookings)
.post(bookingController.createBookingCheckout);

router
.route('/:id')
.get(bookingController.getBooking)
.patch(bookingController.updateBooking)
.delete(bookingController.deleteBooking);


module.exports = router;