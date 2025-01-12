const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures.js');

exports.createReview = catchAsync(async (req, res) => {
  req.body.user = req.user.id;
  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    message: 'Successfully created a review!',
    newReview
  });
});
exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Review does not exist!', 404));
  }
  res.status(200).json({
    status: 'success',
    message: 'Successfully retrieved the review!',
    review
  });
});

exports.getAllReviews = catchAsync(async (req, res) => {
  const features = new APIFeatures(Review.find(), req.query)
    .limitFields()
    .paginate();
  const reviews = await features.query;

  res.status(200).json({
    status: 'success',
    message: 'Successfully retrieved all reviews!',
    reviews
  });
});
