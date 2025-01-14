const express = require('express');
// Merge params allow the router to use the parameters from preceding routes
const router = express.Router({ mergeParams: true });
const controller = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// POST /reviews

// All routes must need authentication
router.use(authController.protect);

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    controller.setTourUserIds,
    controller.createReview
  )
  .get(controller.getAllReviews);

router
  .route('/:id')
  .get(authController.protect, controller.getReview)
  .patch(authController.restrictTo('user', 'admin'), controller.updateReview)
  .delete(authController.restrictTo('user', 'admin'), controller.deleteReview);

module.exports = router;
