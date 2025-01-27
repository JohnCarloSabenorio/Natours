const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  // Create a meaningful message
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
  // Return a new AppError
};

const handleDuplicateFieldDB = err => {
  const value = err.keyValue['name'];
  const message = `Duplicate field value: ${value}. Please use another one.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = errors.join(' ').trim();
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Your token is invalid! Please try again.', 401);
const handleTokenExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);
// Add validation error handler function
// Extract errors from the object
// create message
// return new apperror
const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    console.error('ERROR 💥', err);
    return res.status(err.statusCode).json({
      status: err.statusCode,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // RENDERED WEBSITE
  console.error('ERROR 💥', err);
  console.log('Error:', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
};
const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    // Operational error, trusted: send message to client
    if (err.isOperational) {
      console.error('ERROR 💥', err);
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }

    // Programming/unknown error: don't send error details to client
    console.error('ERROR 💥', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }

  // RENDERED WEBSITE
  if (err.isOperational) {
    console.error('ERROR 💥', err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }

  // Programming/unknown error: don't send error details to client
  console.error('ERROR 💥', err);
  // Send generic message
  // console.log(err.stack);
  return res.status(500).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later!'
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV.trim() == 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV.trim() == 'production') {
    let error = { ...err };
    error.message = err.message;
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code == 11000) error = handleDuplicateFieldDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleTokenExpiredError();
    // Add conditional for validation error
    sendErrorProd(error, req, res);
  }
};
