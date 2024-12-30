const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
// DEFINE ROUTERS
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');
const app = express();

// MIDDLEWARES

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use(express.static(`${__dirname}/public`));

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // Immediately assumes that there is an error, and will skip all middleware and send it directly to global error handling middleware
  next(new AppError(`Cannot find ${req.originalUrl} on the server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
