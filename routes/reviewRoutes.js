const express = require('express');
const router = express.Router();
const controller = require('../controllers/reviewController');
const authController = require('../controllers/authController');
router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    controller.createReview
  )
  .get(controller.getAllReviews);

router.route('/:id').get(authController.protect, controller.getReview);

module.exports = router;
