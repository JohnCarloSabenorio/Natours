const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory.js');

// FOR THE USER
const filterObj = (obj, ...filter) => {
  const filtered = {};
  Object.keys(obj).forEach(el => {
    if (filter.includes(el)) filter[el] = obj[el];
  });

  return filtered;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.updateMe = catchAsync(async (req, res, next) => {
  // Check if password is in the payload
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError('The form contains your password, please try again!', 400)
    );

  // Update the user
  const user = await User.findByIdAndUpdate(
    req.user.id,
    filterObj(req.body, 'user', 'email'),
    {
      new: true,
      runValidators: true
    }
  );

  console.log(user);
  res.status(200).json({
    status: 'success',
    message: 'Successfully updated information!',
    data: user
  });
});

exports.deleteMe = async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false
  });

  res.status(204).json({
    status: 'success',
    data: null
  });
};

// ADMIN PRIVILEGES

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup.'
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// DO NOT UPDATE PASSWORD WITH THIS HANDLER
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
