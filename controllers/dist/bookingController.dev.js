"use strict";

var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

var catchAsync = require('./../utils/catchAsync.js');

var AppError = require('./../utils/appError.js');

var handleFactory = require('./handlerFactory.js');

var Tour = require('./../models/tourModel.js'); // create getCheckoutSession


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
            success_url: "".concat(req.protocol, "://").concat(req.get('host'), "/"),
            cancel_url: "".concat(req.protocol, "://").concat(req.get('host'), "/tour/").concat(tour.slug),
            customer_email: req.user.email,
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