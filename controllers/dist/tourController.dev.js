"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var fs = require('fs');

var APIFeatures = require('./../utils/apiFeatures.js');

var Tour = require('./../models/tourModel');

var catchAsync = require('./../utils/catchAsync.js');

var AppError = require('./../utils/appError.js');

var factory = require('./handlerFactory.js');

var multer = require('multer');

var sharp = require('sharp'); // const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );


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
exports.uploadTourImages = upload.fields([{
  name: 'images',
  maxCount: 3
}]);
exports.resizeTourImages = catchAsync(function _callee2(req, res, next) {
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          console.log('TOUR IAMGES');
          console.log(req.files.images);

          if (!(!req.files.imageCover || !req.files.images)) {
            _context2.next = 4;
            break;
          }

          return _context2.abrupt("return", next());

        case 4:
          // Cover Image
          console.log('IMAGE COVER:');
          console.log(req.files.imageCover);
          req.body.imageCover = "tour-".concat(req.params.id, "-").concat(Date.now(), "-cover.jpeg");
          _context2.next = 9;
          return regeneratorRuntime.awrap(sharp(req.files.imageCover[0].buffer).resize(2000, 1333).toFormat('jpeg').jpeg({
            quality: 90
          }).toFile("public/img/tours/".concat(req.body.imageCover)));

        case 9:
          // Images
          req.body.images = [];
          _context2.next = 12;
          return regeneratorRuntime.awrap(Promise.all(req.files.images.map(function _callee(image, i) {
            var filename;
            return regeneratorRuntime.async(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    filename = "tour-".concat(req.params.id, "-").concat(Date.now(), "-").concat(i + 1, ".jpeg");
                    _context.next = 3;
                    return regeneratorRuntime.awrap(sharp(image.buffer).resize(2000, 1333).toFormat('jpeg').jpeg({
                      quality: 90
                    }).toFile("public/img/tours/".concat(filename)));

                  case 3:
                    req.body.images.push(filename);

                  case 4:
                  case "end":
                    return _context.stop();
                }
              }
            });
          })));

        case 12:
          console.log('REQ BODY: ', req.body);
          next();

        case 14:
        case "end":
          return _context2.stop();
      }
    }
  });
}); // Create handler for uploading imageCover (1) and images (3)
// MIDDLEWARE USED FOR ALIASING

exports.aliasTopTours = function (req, res, next) {
  req.query.limit = '5';
  req.query.sort = 'price';
  req.query.fields = 'name,rating,price,duration,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, {
  path: 'reviews'
});
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour); // AGGREGATE PIPELINE

exports.getTourStats = catchAsync(function _callee3(req, res) {
  var stats;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(Tour.aggregate([{
            $match: {
              ratingsAverage: {
                $gte: 4.5
              }
            }
          }, {
            $group: {
              _id: {
                $toUpper: '$difficulty'
              },
              num: {
                $sum: 1
              },
              numOfRatings: {
                $sum: '$ratingsQuantity'
              },
              avgRating: {
                $avg: '$ratingsAverage'
              },
              avgPrice: {
                $avg: '$price'
              },
              minPrice: {
                $min: '$price'
              },
              maxPrice: {
                $max: '$price'
              }
            }
          }, {
            $sort: {
              avgPrice: 1
            }
          }]));

        case 2:
          stats = _context3.sent;
          res.status(200).json({
            status: 'success',
            data: {
              stats: stats
            }
          });

        case 4:
        case "end":
          return _context3.stop();
      }
    }
  });
});
exports.getMonthlyPlan = catchAsync(function _callee4(req, res) {
  var year, plan;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          year = req.params.year * 1; // Converting the year to int

          _context4.next = 3;
          return regeneratorRuntime.awrap(Tour.aggregate([{
            $unwind: '$startDates'
          }, {
            $match: {
              startDates: {
                $gte: new Date("".concat(year, "-01-01")),
                $lte: new Date("".concat(year, "-12-31"))
              }
            }
          }, {
            $group: {
              _id: {
                $month: '$startDates'
              },
              numTourStarts: {
                $sum: 1
              }
            }
          }, {
            $addFields: {
              month: '$_id'
            }
          }, {
            $project: {
              _id: 0
            }
          }, {
            $sort: {
              numTourStarts: 1
            }
          }, {
            $limit: 6
          }]));

        case 3:
          plan = _context4.sent;
          res.status(200).json({
            status: 'success',
            data: {
              plan: plan
            }
          });

        case 5:
        case "end":
          return _context4.stop();
      }
    }
  });
}); // /tours-within/:distance/center/:latlng/unit/:unit
// ex: /tours-within/ 658/center/34.111745,-118.113491/unit/mi

exports.getToursWithin = catchAsync(function _callee5(req, res, next) {
  var _req$params, distance, latlng, unit, _latlng$split, _latlng$split2, lat, lng, radius, tours;

  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _req$params = req.params, distance = _req$params.distance, latlng = _req$params.latlng, unit = _req$params.unit;
          _latlng$split = latlng.split(','), _latlng$split2 = _slicedToArray(_latlng$split, 2), lat = _latlng$split2[0], lng = _latlng$split2[1]; // Check if the distance is in miles or kilometers

          radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
          console.log('radius:', radius);

          if (!(!lat || !lng)) {
            _context5.next = 6;
            break;
          }

          return _context5.abrupt("return", new AppError('Please specify the coordinates of the latitude and longitude of the location!', 400));

        case 6:
          _context5.next = 8;
          return regeneratorRuntime.awrap(Tour.find({
            startLocation: {
              $geoWithin: {
                $centerSphere: [[lng, lat], radius]
              }
            }
          }));

        case 8:
          tours = _context5.sent;
          console.log('latitude:', lat);
          console.log('longitude', lng);
          res.status(200).json({
            status: 'Success',
            results: tours.length,
            data: tours
          });

        case 12:
        case "end":
          return _context5.stop();
      }
    }
  });
});
exports.getDistances = catchAsync(function _callee6(req, res, next) {
  var _req$params2, latlng, unit, _latlng$split3, _latlng$split4, lat, lng, multiplier, distances;

  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _req$params2 = req.params, latlng = _req$params2.latlng, unit = _req$params2.unit;
          _latlng$split3 = latlng.split(','), _latlng$split4 = _slicedToArray(_latlng$split3, 2), lat = _latlng$split4[0], lng = _latlng$split4[1];
          multiplier = unit === 'mi' ? 0.000621371 : 0.001;

          if (!(!lat || !lng)) {
            _context6.next = 5;
            break;
          }

          return _context6.abrupt("return", new AppError('Please specify the coordinates of the latitude and longitude of the location!', 400));

        case 5:
          _context6.next = 7;
          return regeneratorRuntime.awrap(Tour.aggregate([{
            $geoNear: {
              near: {
                type: 'Point',
                coordinates: [lng * 1, lat * 1]
              },
              distanceField: 'distance',
              distanceMultiplier: multiplier
            }
          }, {
            $project: {
              distance: 1,
              name: 1
            }
          }]));

        case 7:
          distances = _context6.sent;
          res.status(200).json({
            status: 'success',
            data: distances
          });

        case 9:
        case "end":
          return _context6.stop();
      }
    }
  });
});