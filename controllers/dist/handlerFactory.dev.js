"use strict";

var catchAsync = require('./../utils/catchAsync');

var AppError = require('./../utils/appError');

var APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = function (Model) {
  return catchAsync(function _callee(req, res) {
    var doc;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return regeneratorRuntime.awrap(Model.findByIdAndDelete(req.params.id));

          case 2:
            doc = _context.sent;

            if (doc) {
              _context.next = 5;
              break;
            }

            return _context.abrupt("return", next(new AppError("No document found with the id of ".concat(req.params.id), 404)));

          case 5:
            res.status(204).json({
              status: 'success',
              data: null
            });

          case 6:
          case "end":
            return _context.stop();
        }
      }
    });
  });
};

exports.updateOne = function (Model) {
  return catchAsync(function _callee2(req, res) {
    var doc;
    return regeneratorRuntime.async(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            console.log('HAHAAHAHAH');
            console.log('UDPATE BODY:', req.body);
            _context2.next = 4;
            return regeneratorRuntime.awrap(Model.findByIdAndUpdate(req.params.id, req.body, {
              "new": true,
              runValidators: true
            }));

          case 4:
            doc = _context2.sent;

            if (doc) {
              _context2.next = 7;
              break;
            }

            return _context2.abrupt("return", next(new AppError("No doc found with the id of ".concat(req.params.id), 404)));

          case 7:
            res.status(200).json({
              status: 'success',
              data: {
                doc: doc
              }
            });

          case 8:
          case "end":
            return _context2.stop();
        }
      }
    });
  });
};

exports.createOne = function (Model) {
  return catchAsync(function _callee3(req, res) {
    var doc;
    return regeneratorRuntime.async(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return regeneratorRuntime.awrap(Model.create(req.body));

          case 2:
            doc = _context3.sent;
            res.status(201).json({
              status: 'success',
              data: doc
            });

          case 4:
          case "end":
            return _context3.stop();
        }
      }
    });
  });
};

exports.getOne = function (Model, popOptions) {
  return catchAsync(function _callee4(req, res, next) {
    var query, doc;
    return regeneratorRuntime.async(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            query = Model.findById(req.params.id);

            if (popOptions) {
              query = query.populate(popOptions);
            }

            _context4.next = 4;
            return regeneratorRuntime.awrap(query);

          case 4:
            doc = _context4.sent;

            if (doc) {
              _context4.next = 7;
              break;
            }

            return _context4.abrupt("return", next(new AppError("No document found with the id of ".concat(req.params.id), 404)));

          case 7:
            res.status(200).json({
              status: 'success',
              data: doc
            });

          case 8:
          case "end":
            return _context4.stop();
        }
      }
    });
  });
};

exports.getAll = function (Model) {
  return catchAsync(function _callee5(req, res) {
    var filter, features, docs;
    return regeneratorRuntime.async(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            filter = {}; // Filters the query for a specific tour

            if (req.params.tourId) {
              console.log('Filtered!');
              filter.tour = req.params.tourId;
            } // EXECUTE QUERY


            features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate();
            _context5.next = 5;
            return regeneratorRuntime.awrap(features.query);

          case 5:
            docs = _context5.sent;
            // SEND RESPONSE
            res.status(200).json({
              status: 'success',
              results: docs.length,
              data: docs
            });

          case 7:
          case "end":
            return _context5.stop();
        }
      }
    });
  });
};