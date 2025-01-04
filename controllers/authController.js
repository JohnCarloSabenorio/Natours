// note: SHA-256 standard suggests that the secret should be atleast 32 characters long
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('./../utils/appError.js');

const signToken = id => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  const token = signToken(newUser.id);

  res.status(201).json({
    status: 'success',
    token,
    message: 'Successfully created user!',
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  // 1.) Check if password and email exists.
  const { password, email } = req.body;

  if (!password || !email) {
    return next(new AppError('Please provide your email and password!', 400));
  }
  // 2.) Check if user exists && password is correct.

  // +password includes the password in the query since "select" of the password is set to false in the schema.
  const user = await User.findOne({ email: email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('User email or password is incorrect!', 401));
  }

  // 3.) Send token to the client if everything is ok
  const token = signToken(user.id);
  res.status(200).json({
    status: 'success',
    token: token
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Get token and check if it exists
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('Your token does not exist. Please try again.', 401)
    );
  }

  // 2. Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3. Check if user still exists
  console.log(decoded);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user for this token no longer exists.', 401));
  }

  // 4. Check if user changed password after the token was issued
  if(currentUser.passwordChangedAfter(decoded.iat)){
    return next(new AppError('The user has currently changed his/her password. Please try again.', 401));
  }

  // GIVE ACCESS
  next();
});
