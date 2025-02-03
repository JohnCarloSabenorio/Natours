"use strict";

var express = require('express');

router = express.Router();
controller = require('./../controllers/viewController');
authController = require('./../controllers/authController');
bookingController = require('./../controllers/bookingController');
router.get('/me', authController.protect, controller.getAccount);
router.use(authController.isLoggedIn);
router.get('/', bookingController.createBookingCheckout, controller.getOverview);
router.get('/tour/:slug', controller.getTour);
router.post('/submit-user-data', authController.protect, controller.updateUserData);
router.get('/login', controller.getLoginForm);
router.get('/my-tours', authController.protect, controller.getMyTours);
module.exports = router;