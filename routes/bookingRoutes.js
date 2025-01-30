const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

// Create route for getting a checkout-session

router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession
);

module.exports = router;
