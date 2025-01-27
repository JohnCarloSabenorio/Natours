"use strict";

var mongoose = require('mongoose');

var validator = require('validator');

var bcrypt = require('bcryptjs');

var crypto = require('crypto');

var _require = require('morgan'),
    token = _require.token; // CREATE USER SCHEMA WITH THE FOLLOWING FIELDS:

/* 
1. name
2. email
3. photo
4. password
5. passwordConfirm 
*/


var userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    lowercase: true,
    required: [true, 'Please tell us your email'],
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  role: {
    type: String,
    "enum": {
      values: ['user', 'guide', 'lead-guide', 'admin'],
      message: '{VALUE} is not a valid role. The allowed roles are: user, guide, lead-guide, and admin.'
    },
    "default": 'user'
  },
  photo: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a  password!'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
    select: false,
    validate: {
      validator: function validator(el) {
        return el === this.password;
      },
      message: 'Your passwords do not match!'
    }
  },
  passwordResetToken: String,
  tokenExpirationDate: Date,
  passwordChangedAt: Date,
  active: {
    type: Boolean,
    "default": true,
    select: false
  }
}); // ADD ENCRYPTION
// DOCUMENT MIDDLEWARE

userSchema.pre('save', function _callee(next) {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (this.isModified('password')) {
            _context.next = 2;
            break;
          }

          return _context.abrupt("return", next());

        case 2:
          _context.next = 4;
          return regeneratorRuntime.awrap(bcrypt.hash(this.password, 12));

        case 4:
          this.password = _context.sent;
          // Deletes password confirm field
          this.passwordConfirm = undefined;
          next();

        case 7:
        case "end":
          return _context.stop();
      }
    }
  }, null, this);
});
userSchema.pre('save', function _callee2(next) {
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          if (!(!this.isModified('password') || this.isNew)) {
            _context2.next = 2;
            break;
          }

          return _context2.abrupt("return", next());

        case 2:
          this.passwordChangedAt = Date.now() - 1000;
          next();

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  }, null, this);
}); // QUERY MIDDLEWARE

userSchema.pre(/^find/, function _callee3(next) {
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          this.find({
            active: {
              $ne: false
            }
          });
          next();

        case 2:
        case "end":
          return _context3.stop();
      }
    }
  }, null, this);
}); // INSTANCE METHODS

userSchema.methods.correctPassword = function _callee4(candidatePassword, userPassword) {
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(bcrypt.compare(candidatePassword, userPassword));

        case 2:
          return _context4.abrupt("return", _context4.sent);

        case 3:
        case "end":
          return _context4.stop();
      }
    }
  });
};

userSchema.methods.passwordChangedAfter = function (JWTDateIssued) {
  if (!this.passwordChangedAt) return false; // Password has never been changed

  var changedPwordTimeStamp = this.passwordChangedAt.getTime() / 1000;
  return changedPwordTimeStamp > JWTDateIssued;
}; // create password reset token function

/* 
1. create random 32 bytes of a random string 
2. hash the passwordresettoken and store it in the document
3. set the expiration date of the token in 10 mins
4. return the unencrypted token
*/


userSchema.methods.createPasswordResetToken = function () {
  console.log('Creating password reset token');
  var resetToken = crypto.randomBytes(64).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.tokenExpirationDate = Date.now() + 10 * 60 * 1000;
  console.log(resetToken, this.passwordResetToken);
  return resetToken;
};

var User = mongoose.model('User', userSchema);
module.exports = User; // Create authController.js
// import user model
// create signup handler