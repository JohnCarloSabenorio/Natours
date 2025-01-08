const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// FOR THE USER
const filterObj = (obj, ...filter) => {
  const filtered = {};
  Object.keys(obj).forEach(el => {
    if (filter.includes(el)) filter[el] = obj[el];
  });

  return filtered;
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
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();
  console.log('USERS: ', users);
  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    data: users
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};


