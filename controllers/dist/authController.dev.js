"use strict";

// note: SHA-256 standard suggests that the secret should be atleast 32 characters long
var jwt = require('jsonwebtoken');

var _require = require('util'),
    promisify = _require.promisify;

var User = require('./../models/userModel');

var catchAsync = require('./../utils/catchAsync.js');

var AppError = require('./../utils/appError.js');

var Email = require('./../utils/email.js');

var crypto = require('crypto');

var signToken = function signToken(id) {
  return jwt.sign({
    id: id
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

var createSignToken = function createSignToken(user, statusCode, res) {
  var token = signToken(user.id); // Create options for the cookie: expiration date, httpOnly

  var cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
  }; // If environment is in production, set secure to true

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; // Create cookie

  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    token: token,
    message: 'Successfully created user!',
    data: user
  });
};

exports.signup = catchAsync(function _callee(req, res, next) {
  var newUser, url;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            role: req.body.role
          }));

        case 2:
          newUser = _context.sent;
          url = "".concat(req.protocol, "://").concat(req.get('host'), "/me");
          console.log(url);
          _context.next = 7;
          return regeneratorRuntime.awrap(new Email(newUser, url).sendWelcome());

        case 7:
          // User automatically logs in after signing up
          createSignToken(newUser, 201, res);

        case 8:
        case "end":
          return _context.stop();
      }
    }
  });
});
exports.login = catchAsync(function _callee2(req, res, next) {
  var _req$body, password, email, user;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          // 1.) Check if password and email exists.
          _req$body = req.body, password = _req$body.password, email = _req$body.email;
          console.log(req.body);

          if (!(!password || !email)) {
            _context2.next = 4;
            break;
          }

          return _context2.abrupt("return", next(new AppError('Please provide your email and password!', 400)));

        case 4:
          _context2.next = 6;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }).select('+password'));

        case 6:
          user = _context2.sent;
          _context2.t0 = !user;

          if (_context2.t0) {
            _context2.next = 12;
            break;
          }

          _context2.next = 11;
          return regeneratorRuntime.awrap(user.correctPassword(password, user.password));

        case 11:
          _context2.t0 = !_context2.sent;

        case 12:
          if (!_context2.t0) {
            _context2.next = 14;
            break;
          }

          return _context2.abrupt("return", next(new AppError('User email or password is incorrect!', 401)));

        case 14:
          // 3.) Send token to the client if everything is ok
          createSignToken(user, 200, res);

        case 15:
        case "end":
          return _context2.stop();
      }
    }
  });
});

exports.logout = function (req, res) {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({
    status: 'success'
  });
};

exports.protect = catchAsync(function _callee3(req, res, next) {
  var token, decoded, currentUser;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          // 1. Get token and check if it exists
          if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            // authorization === Bearer + " " + token
            token = req.headers.authorization.split(' ')[1];
          } else if (req.cookies.jwt) {
            token = req.cookies.jwt;
          }

          if (token) {
            _context3.next = 3;
            break;
          }

          return _context3.abrupt("return", next(new AppError('You are not logged in! Please try again.', 401)));

        case 3:
          _context3.next = 5;
          return regeneratorRuntime.awrap(promisify(jwt.verify)(token, process.env.JWT_SECRET));

        case 5:
          decoded = _context3.sent;
          // 3. Check if user still exists
          console.log(decoded);
          _context3.next = 9;
          return regeneratorRuntime.awrap(User.findById(decoded.id));

        case 9:
          currentUser = _context3.sent;

          if (currentUser) {
            _context3.next = 12;
            break;
          }

          return _context3.abrupt("return", next(new AppError('The user for this token no longer exists.', 401)));

        case 12:
          if (!currentUser.passwordChangedAfter(decoded.iat)) {
            _context3.next = 14;
            break;
          }

          return _context3.abrupt("return", next(new AppError('The user has currently changed his/her password. Please try again.', 401)));

        case 14:
          // GRANT ACCESS TO PROTECTED ROUTE
          req.user = currentUser;
          res.locals.user = currentUser;
          next();

        case 17:
        case "end":
          return _context3.stop();
      }
    }
  });
});

exports.isLoggedIn = function _callee4(req, res, next) {
  var decoded, currentUser;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          if (!req.cookies.jwt) {
            _context4.next = 20;
            break;
          }

          _context4.prev = 1;
          _context4.next = 4;
          return regeneratorRuntime.awrap(promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET));

        case 4:
          decoded = _context4.sent;
          console.log(decoded);
          _context4.next = 8;
          return regeneratorRuntime.awrap(User.findById(decoded.id));

        case 8:
          currentUser = _context4.sent;

          if (currentUser) {
            _context4.next = 11;
            break;
          }

          return _context4.abrupt("return", next());

        case 11:
          if (!currentUser.passwordChangedAfter(decoded.iat)) {
            _context4.next = 13;
            break;
          }

          return _context4.abrupt("return", next());

        case 13:
          // THERE IS A LOGGED IN USER
          res.locals.user = currentUser; // req.user = currentUser;

          return _context4.abrupt("return", next());

        case 17:
          _context4.prev = 17;
          _context4.t0 = _context4["catch"](1);
          return _context4.abrupt("return", next());

        case 20:
          return _context4.abrupt("return", next());

        case 21:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[1, 17]]);
};

exports.restrictTo = function () {
  for (var _len = arguments.length, roles = new Array(_len), _key = 0; _key < _len; _key++) {
    roles[_key] = arguments[_key];
  }

  return function (req, res, next) {
    console.log('Roles with permission: ', roles);

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action!', 403));
    }

    console.log("".concat(req.user.name, " is allowed to perform this action!"));
    next();
  };
};

exports.forgotPassword = catchAsync(function _callee5(req, res, next) {
  var user, resetToken, reqUrl;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return regeneratorRuntime.awrap(User.findOne({
            email: req.body.email
          }));

        case 2:
          user = _context5.sent;

          if (user) {
            _context5.next = 5;
            break;
          }

          return _context5.abrupt("return", next(new AppError('A user with this email does not exist!', 404)));

        case 5:
          // 2.) Generate the random reset token
          resetToken = user.createPasswordResetToken();
          _context5.next = 8;
          return regeneratorRuntime.awrap(user.save({
            validateBeforeSave: false
          }));

        case 8:
          _context5.prev = 8;
          reqUrl = "".concat(req.protocol, "://").concat(req.get('host'), "/api/v1/users/resetPassword/").concat(resetToken);
          console.log('SENDING EMAIL');
          _context5.next = 13;
          return regeneratorRuntime.awrap(new Email(user, reqUrl).sendResetPassword());

        case 13:
          res.status(200).json({
            status: 'success',
            message: 'Email has been successfully sent to the user!'
          });
          _context5.next = 24;
          break;

        case 16:
          _context5.prev = 16;
          _context5.t0 = _context5["catch"](8);
          console.log(_context5.t0);
          user.passwordResetToken = undefined;
          user.tokenExpirationDate = undefined;
          _context5.next = 23;
          return regeneratorRuntime.awrap(user.save({
            validateBeforeSave: false
          }));

        case 23:
          return _context5.abrupt("return", next(new AppError('There was an error sending the email to the user!', 500)));

        case 24:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[8, 16]]);
});
exports.resetPassword = catchAsync(function _callee6(req, res, next) {
  var candidateToken, user;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          // 1. hash token so that it matches the one in the db
          candidateToken = crypto.createHash('sha256').update(req.params.token).digest('hex'); // 2. Get user based on token

          _context6.next = 3;
          return regeneratorRuntime.awrap(User.findOne({
            passwordResetToken: candidateToken,
            tokenExpirationDate: {
              $gt: Date.now()
            }
          }));

        case 3:
          user = _context6.sent;
          // 3. If token has not expired and there is a user, set the new password
          console.log(user);

          if (user) {
            _context6.next = 7;
            break;
          }

          return _context6.abrupt("return", next(new AppError('The token for resetting your password is invalid or expired!', 400)));

        case 7:
          // 4. update password in the db
          user.password = req.body.password;
          user.passwordConfirm = req.body.passwordConfirm;
          user.passwordResetToken = undefined;
          user.tokenExpirationDate = undefined;
          _context6.next = 13;
          return regeneratorRuntime.awrap(user.save());

        case 13:
          // 5. Log the user in, send JWT to the client
          createSignToken(user, 200, res);

        case 14:
        case "end":
          return _context6.stop();
      }
    }
  });
});
exports.updatePassword = catchAsync(function _callee7(req, res, next) {
  var user;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.user.id).select('+password'));

        case 2:
          user = _context7.sent;

          if (user) {
            _context7.next = 5;
            break;
          }

          return _context7.abrupt("return", next(new AppError('User does not exist!', 404)));

        case 5:
          _context7.next = 7;
          return regeneratorRuntime.awrap(user.correctPassword(req.body.currentPassword, user.password));

        case 7:
          if (_context7.sent) {
            _context7.next = 9;
            break;
          }

          return _context7.abrupt("return", next(new AppError('Your current password is incorrect!')));

        case 9:
          // 3. If correct, update the password
          user.password = req.body.newPassword;
          user.passwordConfirm = req.body.confirmNewPassword;
          _context7.next = 13;
          return regeneratorRuntime.awrap(user.save());

        case 13:
          // 4. Keep the user logged in!
          createSignToken(user, 200, res);

        case 14:
        case "end":
          return _context7.stop();
      }
    }
  });
}); // IN THE FUTURE TRY TO IMPLEMENT THESE FOLLOWING FEATURES:

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