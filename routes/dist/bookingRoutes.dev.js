"use strict";

var express = require('express');

var router = express.Router();

var authController = require('./../controllers/authController');

var bookingController = require('./../controllers/bookingController'); // Create route for getting a checkout-session


router.get('/checkout-session/:tourId', authController.protect, bookingController.getCheckoutSession);
module.exports = router;