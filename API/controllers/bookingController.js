const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const Session = require('../models/sessionModel');
const Booking = require('../models/bookingModel');

exports.getCheckout = catchAsync(async (req, res, next) => {
    const session = await Session.findById(req.params.sessionId);

    const checkout = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/thank-you?session=${req.params.sessionId}&user=${req.user.id}&price=${session.price}&roster=${session.rosterLimit}`,
        cancel_url: `${req.protocol}://${req.get('host')}/session/${session.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.sessionId,
        mode: 'payment',
        line_items: [
            {
                price_data: {
                    unit_amount: session.price * 100,
                    currency: 'usd',
                    product_data: {
                        name: `${session.name}`,
                        description: `${session.description}`,
                        images: [`https://static.wixstatic.com/media/ea0f5b_b662786d769b4485bf6eee635a24dd89~mv2.png/v1/fill/w_260,h_186,al_c,q_85,usm_4.00_1.00_0.00,enc_auto/XL%20rtp%20logo.png`],
                    }
                },
                quantity: 1
            }
        ]
    });

    res.status(200).json({
        status: 'success',
        checkout
    });
});

exports.createBookingCheckout = catchAsync (async (req, res, next) => {
    // Temporary!! Insecure because only need URL to book without paying
    const { session, user, price}= await req.query;

    if(!session && !user && !price) return next();
    await Booking.create({ session, user, price});

    res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);