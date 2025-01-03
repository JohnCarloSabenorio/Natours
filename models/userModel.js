const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
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
  photo: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a  password!'],
    minlength: 8
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: 'Your passwords do not match!'
    }
  }
});

// ADD ENCRYPTION

// Will only run if password is modified
userSchema.pre('save', async function(next) {
  if (!this.isModified) return;
  this.password = await bcrypt.hash(this.password, 12);
  // Deletes password confirm field
  this.passwordConfirm = undefined;
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;

// Create authController.js
// import user model
// create signup handler
