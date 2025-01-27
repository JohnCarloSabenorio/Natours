"use strict";

var User = require('./../models/userModel');

var catchAsync = require('./../utils/catchAsync');

var AppError = require('./../utils/appError');

var factory = require('./handlerFactory.js'); // FOR THE USER


var filterObj = function filterObj(obj) {
  for (var _len = arguments.length, filter = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    filter[_key - 1] = arguments[_key];
  }

  var filtered = {};
  Object.keys(obj).forEach(function (el) {
    console.log('THE EL:', el);
    console.log(filter.includes(el));
    if (filter.includes(el)) filtered[el] = obj[el];
  });
  return filtered;
};

exports.getMe = function (req, res, next) {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(function _callee(req, res, next) {
  var user;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!(req.body.password || req.body.passwordConfirm)) {
            _context.next = 2;
            break;
          }

          return _context.abrupt("return", next(new AppError('The form contains your password, please try again!', 400)));

        case 2:
          _context.next = 4;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.user.id, filterObj(req.body, 'name', 'email'), {
            "new": true,
            runValidators: true
          }));

        case 4:
          user = _context.sent;
          console.log(user);
          res.status(200).json({
            status: 'success',
            message: 'Successfully updated information!',
            data: user
          });

        case 7:
        case "end":
          return _context.stop();
      }
    }
  });
});

exports.deleteMe = function _callee2(req, res) {
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.user.id, {
            active: false
          }));

        case 2:
          res.status(204).json({
            status: 'success',
            data: null
          });

        case 3:
        case "end":
          return _context2.stop();
      }
    }
  });
}; // ADMIN PRIVILEGES


exports.createUser = function (req, res) {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup.'
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User); // DO NOT UPDATE PASSWORD WITH THIS HANDLER

exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);