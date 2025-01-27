// note: SHA-256 standard suggests that the secret should be atleast 32 characters long
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('./../utils/appError.js');
const sendEmail = require('./../utils/email.js');
const crypto = require('crypto');

const signToken = id => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSignToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  // Create options for the cookie: expiration date, httpOnly
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  // If environment is in production, set secure to true
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // Create cookie
  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    message: 'Successfully created user!',
    data: user
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role
  });

  // User automatically logs in after signing up
  createSignToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  // 1.) Check if password and email exists.
  const { password, email } = req.body;
  console.log(req.body);
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

  createSignToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    status: 'success'
  });
};
exports.protect = catchAsync(async (req, res, next) => {
  // 1. Get token and check if it exists
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // authorization === Bearer + " " + token
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please try again.', 401));
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
  if (currentUser.passwordChangedAfter(decoded.iat)) {
    return next(
      new AppError(
        'The user has currently changed his/her password. Please try again.',
        401
      )
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  console.log('THIS IS THE CURRENT USER: ', req.user);
  next();
});
exports.isLoggedIn = async (req, res, next) => {
  // Verify token
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      console.log(decoded);
      const currentUser = await User.findById(decoded.id);

      // Check if the user still exists
      if (!currentUser) {
        return next();
      }

      // Check if the user changed his/her password
      if (currentUser.passwordChangedAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      // req.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  return next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log('Roles with permission: ', roles);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action!', 403)
      );
    }
    console.log(`${req.user.name} is allowed to perform this action!`);
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1.) Get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('A user with this email does not exist!', 404));
  }

  // 2.) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const reqUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request to ${reqUrl}. If you didn't forget your password, please ignore this message.`;

  // 3.) Send it to the user's email
  try {
    console.log('SENDING EMAIL');
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Email has been successfully sent to the user!'
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.tokenExpirationDate = undefined;
    await user.save({
      validateBeforeSave: false
    });

    return next(
      new AppError('There was an error sending the email to the user!', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. hash token so that it matches the one in the db
  const candidateToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // 2. Get user based on token
  const user = await User.findOne({
    passwordResetToken: candidateToken,
    tokenExpirationDate: {
      $gt: Date.now()
    }
  });
  // 3. If token has not expired and there is a user, set the new password
  console.log(user);
  if (!user) {
    return next(
      new AppError(
        'The token for resetting your password is invalid or expired!',
        400
      )
    );
  }

  // 4. update password in the db
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.tokenExpirationDate = undefined;
  await user.save();

  // 5. Log the user in, send JWT to the client

  createSignToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    return next(new AppError('User does not exist!', 404));
  }

  // 2. Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password is incorrect!'));
  }
  // 3. If correct, update the password

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.confirmNewPassword;
  await user.save();

  // 4. Keep the user logged in!
  createSignToken(user, 200, res);
});

// IN THE FUTURE TRY TO IMPLEMENT THESE FOLLOWING FEATURES:
/* 
1. IMPLEMENT MAXIMUM LOGIN ATTEMPTS FEATURE
2. PREVENT CSRF
3. REQUIRE RE-AUTHENTICATION BEFORE A HIGH-VALUE ACTION
4. BLACKLIST OF UNTRUSTED TOKENS
5. CONFIRM USER EMAIL ADDRESS
6. REFRESH TOKENS
7. IMPLEMENT TWO-FACTOR AUTHENTICATION

*/
// lEARN NOSQL Query injection
