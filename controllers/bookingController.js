const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');
const handleFactory = require('./handlerFactory.js');
const Tour = require('../models/tourModel.js');
const Booking = require('../models/bookingModel.js');
// create getCheckoutSession

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1. Get currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  console.log('CURRENT TOUR:');
  console.log(tour);
  console.log('CURRENT USER:');
  console.log(req.user);

  // 2. Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`, // NOT SECURE (JUST A WORKAROUND)
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: 'bluem@mailsac.com', // req.user.email
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          unit_amount: tour.price * 100,
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            images: [`https://natours.dev/img/tours/${tour.imageCover}`],
            description: tour.summary
          }
        }
      }
    ]
  });

  // 3. Create session as response
  res.status(200).json({
    status: 'success',
    session
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is only temporary because it is unsecured
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = handleFactory.createOne(Booking);
exports.getBooking = handleFactory.getOne(Booking);
exports.getAllBookings = handleFactory.getAll(Booking);
exports.updateBooking = handleFactory.updateOne(Booking);
exports.deleteBooking = handleFactory.deleteOne(Booking);