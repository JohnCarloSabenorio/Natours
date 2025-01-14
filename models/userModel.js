const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { token } = require('morgan');
// CREATE USER SCHEMA WITH THE FOLLOWING FIELDS:
/* 
1. name
2. email
3. photo
4. password
5. passwordConfirm 
*/
const userSchema = new mongoose.Schema({
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
    enum: {
      values: ['user', 'guide', 'lead-guide', 'admin'],
      message:
        '{VALUE} is not a valid role. The allowed roles are: user, guide, lead-guide, and admin.'
    },
    default: 'user'
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
      validator: function(el) {
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
    default: true,
    select: false
  }
});

// ADD ENCRYPTION

// DOCUMENT MIDDLEWARE
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   // Deletes password confirm field
//   this.passwordConfirm = undefined;
//   next();
// });

// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password') || this.isNew) return next();
//   this.passwordChangedAt = Date.now() - 1000;
//   next();
// });

// QUERY MIDDLEWARE
userSchema.pre(/^find/, async function(next) {
  this.find({ active: { $ne: false } });
  next();
});

// INSTANCE METHODS
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.passwordChangedAfter = function(JWTDateIssued) {
  if (!this.passwordChangedAt) return false; // Password has never been changed
  const changedPwordTimeStamp = this.passwordChangedAt.getTime() / 1000;
  return changedPwordTimeStamp > JWTDateIssued;
};

// create password reset token function
/* 
1. create random 32 bytes of a random string 
2. hash the passwordresettoken and store it in the document
3. set the expiration date of the token in 10 mins
4. return the unencrypted token
*/
userSchema.methods.createPasswordResetToken = function() {
  console.log('Creating password reset token');
  const resetToken = crypto.randomBytes(64).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.tokenExpirationDate = Date.now() + 10 * 60 * 1000;
  console.log(resetToken, this.passwordResetToken);
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;

// Create authController.js
// import user model
// create signup handler
