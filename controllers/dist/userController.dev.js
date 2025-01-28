"use strict";

var User = require('./../models/userModel');

var catchAsync = require('./../utils/catchAsync');

var AppError = require('./../utils/appError');

var factory = require('./handlerFactory.js');

var sharp = require('sharp');

var multer = require('multer'); // const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     // fname structure: user-id-timestamp.ext
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });


var multerStorage = multer.memoryStorage();

var multerFilter = function multerFilter(req, file, cb) {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

var upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = function (req, res, next) {
  if (!req.file) return next();
  req.file.filename = "user-".concat(req.user.id, "-").concat(Date.now(), ".jpeg");
  console.log('REQ BUFFER:', req.file.buffer);
  sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({
    quality: 90
  }).toFile("public/img/users/".concat(req.file.filename));
  next();
}; // FOR THE USER


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
}; // create resizeUserPhoto handler


exports.getMe = function (req, res, next) {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(function _callee(req, res, next) {
  var filteredBody, user;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log(req.body);
          console.log(req.file); // Check if password is in the payload

          if (!(req.body.password || req.body.passwordConfirm)) {
            _context.next = 4;
            break;
          }

          return _context.abrupt("return", next(new AppError('The form contains your password, please try again!', 400)));

        case 4:
          filteredBody = filterObj(req.body, 'name', 'email');
          if (req.file) filteredBody.photo = req.file.filename;
          _context.next = 8;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.user.id, filteredBody, {
            "new": true,
            runValidators: true
          }));

        case 8:
          user = _context.sent;
          console.log(user);
          res.status(200).json({
            status: 'success',
            message: 'Successfully updated information!',
            data: user
          });

        case 11:
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