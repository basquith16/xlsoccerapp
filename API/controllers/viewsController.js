const Session = require('../models/sessionModel');
const update = require('../controllers/sessionController');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const Player = require('../models/playerModel');
const Review = require('../models/reviewModel');
const stripe = require('stripe')('sk_test_51NctyzC5wZsDYstkYfYfCLqAQjwbPZd3xEPKbcpBSzovp2sFfb5O4lriJs8GDHJYxxPsLPAsXsrYHcF7FkCxxZsX00ZbNFKR3s');

exports.getHomepage = catchAsync(async (req, res, next) => {
    const review = await Review.find();
    const users = await User.find();
    
    res.status(200).render('homepage', {
        title: 'Welcome to XL Lake NONA!',
        review,
        users
    });
});

exports.getLogin = catchAsync(async (req, res, next) => {
    
    res.status(200).render('login', {
        title: 'Login to Your Account'
    });
});

exports.getRegistration = catchAsync(async (req, res, next) => {
    
    res.status(200).render('register', {
        title: 'Register for an Account'
    });
});


exports.getSessions = catchAsync(async (req, res, next) => {
    const query = req.query;

    const bookings = await Booking.find();
    const sessions = await Session.find(query);

    if (!sessions) {
        return next(new AppError('No sessions found.', 404));
    }

    // Calculate Available Roster Spots
    const calcRoster = (bookingID) => {
        for (session of sessions) {
            if (session.id == bookingID) {
                session.rosterLimit = session.rosterLimit - 1;
            }
        }
    }
    const getBookedSession = (booking) => {
        calcRoster(booking.session.id);
    }
    bookings.forEach(getBookedSession);


    res.status(200).render('sessions', {
        title: 'XL Nona Training',
        sessions
    });
});

exports.getSession = catchAsync(async (req, res, next) => {

    const session = await Session.findOne({slug: req.params.slug});

    if (!session) {
        return next(new AppError('There is no session with that name.', 404));
    }

    res.status(200).render('single-session', {
        title: `${session.name}`,
        trainer: `${session.trainer}`,
        session
    });
});

exports.myAccount = catchAsync(async (req, res, next) => {
    // Get Coaches for create Session Form
    let coaches = [];
    const users = await User.find();

    users.forEach(async (user) => {
        if(user.role === 'coach') {
            coaches.push(user);
        }
    });

    res.status(200).render('account', {
        title: 'My Account',
        coaches,
    });
});

exports.getMySessions = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({ user: req.user.id });
    const sessionIDs = bookings.map(el => el.session);
    const sessions = await Session.find({ _id: { $in: sessionIDs }});

    res.status(200).render('my-sessions', {
        title: 'My Sessions',
        sessions
    });

});

exports.getMyPlayers = catchAsync(async (req, res, next) => {
    let getPlayers = await Player.find();
    const getSessions = await Session.find();


    res.status(200).render('my-players', {
        title: 'My Players',
        getPlayers,
        getSessions
    });
});

exports.getMyInvoices = catchAsync(async (req, res, next) => {
    const invoiceList = await stripe.invoices.list({
        limit: 10,
    });
    const customer = await stripe.customers.retrieve(
        'cus_OQciyRvUX1Tk9z'
      );

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });
    
    let invoices = [];

    (invoiceList.data).forEach(async (invoice) => {
        invoices.push(invoice);
    });

    console.log(invoiceList.data);


    res.status(200).render('my-billing', {
        title: 'My Invoices',
        invoices,
        formatter,
        customer
    });

});

exports.getAdminSessions = catchAsync(async (req, res, next) => {
     // Get Training Session Data for Admin Panel
     const sessions = await Session.find();
     
     // Get Coaches for create Session Form
     let coaches = [];
     const users = await User.find();
 
     users.forEach(async (user) => {
         if(user.role === 'coach') {
             coaches.push(user);
         }
     });

    res.status(200).render('admin-sessions', {
        title: 'Manage Training Sessions',
        coaches,
        sessions
    });

});

exports.getAdminUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();

   res.status(200).render('admin-manage-users', {
       title: 'Manage Users',
       users
   });

});

exports.getAdminPlayers = catchAsync(async (req, res, next) => {
    let players = await Player.find();

   res.status(200).render('admin-manage-players', {
       title: 'Manage Players',
       players
   });

});

exports.getSingleUser = catchAsync(async (req, res, next) => {
    const queryString = Object.keys(req.query)[0];

    let user = await User.findById(queryString);

   res.status(200).render('admin-single-user', {
       title: 'Manage User',
       user
   });

});

exports.getThankYou = catchAsync(async (req, res, next) => {
    const sessionID = await req.query.session;
    const rosterCount = await req.query.roster - 1;
    const session = await Session.findOneAndUpdate({ _id: sessionID }, {rosterLimit: rosterCount});

   res.status(200).render('thank-you', {
       title: 'Thank You For Your Purchase',
       session
   });

});

