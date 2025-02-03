"use strict";

var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

var catchAsync = require('../utils/catchAsync.js');

var AppError = require('../utils/appError.js');

var handleFactory = require('./handlerFactory.js');

var Tour = require('../models/tourModel.js');

var Booking = require('../models/bookingModel.js'); // create getCheckoutSession


exports.getCheckoutSession = catchAsync(function _callee(req, res, next) {
  var tour, session;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(Tour.findById(req.params.tourId));

        case 2:
          tour = _context.sent;
          console.log('CURRENT TOUR:');
          console.log(tour);
          console.log('CURRENT USER:');
          console.log(req.user); // 2. Create checkout session

          _context.next = 9;
          return regeneratorRuntime.awrap(stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            success_url: "".concat(req.protocol, "://").concat(req.get('host'), "/?tour=").concat(req.params.tourId, "&user=").concat(req.user.id, "&price=").concat(tour.price),
            // NOT SECURE (JUST A WORKAROUND)
            cancel_url: "".concat(req.protocol, "://").concat(req.get('host'), "/tour/").concat(tour.slug),
            customer_email: 'bluem@mailsac.com',
            // req.user.email
            client_reference_id: req.params.tourId,
            mode: 'payment',
            line_items: [{
              quantity: 1,
              price_data: {
                unit_amount: tour.price * 100,
                currency: 'usd',
                product_data: {
                  name: "".concat(tour.name, " Tour"),
                  images: ["https://natours.dev/img/tours/".concat(tour.imageCover)],
                  description: tour.summary
                }
              }
            }]
          }));

        case 9:
          session = _context.sent;
          // 3. Create session as response
          res.status(200).json({
            status: 'success',
            session: session
          });

        case 11:
        case "end":
          return _context.stop();
      }
    }
  });
});
exports.createBookingCheckout = catchAsync(function _callee2(req, res, next) {
  var _req$query, tour, user, price;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          // This is only temporary because it is unsecured
          _req$query = req.query, tour = _req$query.tour, user = _req$query.user, price = _req$query.price;

          if (!(!tour && !user && !price)) {
            _context2.next = 3;
            break;
          }

          return _context2.abrupt("return", next());

        case 3:
          _context2.next = 5;
          return regeneratorRuntime.awrap(Booking.create({
            tour: tour,
            user: user,
            price: price
          }));

        case 5:
          res.redirect(req.originalUrl.split('?')[0]);

        case 6:
        case "end":
          return _context2.stop();
      }
    }
  });
});
exports.createBooking = handleFactory.createOne(Booking);
exports.getBooking = handleFactory.getOne(Booking);
exports.getAllBookings = handleFactory.getAll(Booking);
exports.updateBooking = handleFactory.updateOne(Booking);
exports.deleteBooking = handleFactory.deleteOne(Booking);