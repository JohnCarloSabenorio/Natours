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

// Add validation error handler function
// Extract errors from the object
// create message
// return new apperror
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};
const sendErrorProd = (err, res) => {
  console.log('IS ERROR OPERATIONAL: ', err.isOperational);
  // Operational error, trusted: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }
  // Programming/unknown error: don't send error details to client
  else {
    // Log error
    console.error('ERROR 💥', err);
    // Send generic message
    console.log(err.stack);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV.trim() == 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV.trim() == 'production') {
    let error = { ...err };
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code == 11000) error = handleDuplicateFieldDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    // Add conditional for validation error
    sendErrorProd(error, res);
  }
};
