const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getBase = (req, res, next) => {
  res.status(200).render('base', {
    tour: 'The Forest Hiker'
  });
};

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = (req, res, next) => {
  res.status(200).render('tour', {
    title: 'The Forest Hiker Tour'
  });
};
