"use strict";

var express = require('express');

var router = express.Router();

var authController = require('./../controllers/authController');

var bookingController = require('./../controllers/bookingController'); // Create route for getting a checkout-session


router.get('/checkout-session/:tourId', authController.protect, bookingController.getCheckoutSession);
router.use(authController.protect);
router.route('/:id').get(bookingController.getBooking).patch(bookingController.updateBooking)["delete"](bookingController.deleteBooking);
router.use(authController.restrictTo('admin', 'lead-guide'));
router.route('/').get(bookingController.getAllBookings).post(bookingController.createBooking);
module.exports = router;