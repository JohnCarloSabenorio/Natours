"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bookTour = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _stripeJs = require("@stripe/stripe-js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var stripePromise = (0, _stripeJs.loadStripe)('pk_test_51QmnRYKjlTguqniSA0ZlNazo842LWXWJliy5Ufp2JCaGsODy1AvTx9kHwgb8Cb8Z6ZPwC0i0UZmH9bXwpFFB5Gkp00q2AXBbMT');

var bookTour = function bookTour(tourId) {
  var session, stripe;
  return regeneratorRuntime.async(function bookTour$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap((0, _axios["default"])("/api/v1/bookings/checkout-session/".concat(tourId)));

        case 3:
          session = _context.sent;
          _context.next = 6;
          return regeneratorRuntime.awrap(stripePromise);

        case 6:
          stripe = _context.sent;
          _context.next = 9;
          return regeneratorRuntime.awrap(stripe.redirectToCheckout({
            sessionId: session.data.session.id
          }));

        case 9:
          _context.next = 14;
          break;

        case 11:
          _context.prev = 11;
          _context.t0 = _context["catch"](0);
          console.log(_context.t0);

        case 14:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 11]]);
};

exports.bookTour = bookTour;