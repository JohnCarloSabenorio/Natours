"use strict";

var express = require('express');

var tourController = require('./../controllers/tourController');

var authController = require('./../controllers/authController');

var reviewController = require('./../controllers/reviewController');

var router = express.Router();

var reviewRouter = require('./../routes/reviewRoutes'); // router.param('id', tourController.checkId);
// ROUTES
// POST /tours/:tourId/reviews
// GET /tours/:tourId/reviews


router.use('/:tourId/reviews', reviewRouter);
router.route('/top-5-cheapest').get(tourController.aliasTopTours, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan); // Add geospatial route: parameters: distance, ltlng, unit

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
router.route('/').get(tourController.getAllTours).post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour); // admin and lead-guide only

router.route('/:id').get(tourController.getTour).patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.uploadTourImages, tourController.resizeTourImages, tourController.updateTour) // admin and lead guide only
["delete"](authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour); // Simple nested routes
// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

module.exports = router;