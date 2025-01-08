const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssFilters = require('xss-filters');
const hpp = require('hpp');
const AppError = require('./utils/appError');
// DEFINE ROUTERS
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');
const app = express();

// GLOBAL MIDDLEWARES

// Set security HTTP headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  // Development logging
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  limit: 100,
  windowMs: 60 * 60 * 1000, // 1 hour,
  message: 'Too many requests, please try again after 1 hour!'
});

// limit requests from the same API
app.use('/api', limiter);

// Body parser (reading data from body to req.body)
app.use(
  express.json({
    limit: '10kb'
  })
);

// Data sanitization against NoSQL Query injection
app.use(mongoSanitize());

// Data sanitization against XSS (Kinda also handles nosql query injection as it converts the query to js object)
app.use((req, res, next) => {
  filteredBody = {};
  Object.keys(req.body).forEach(input => {
    filteredBody[input] = xssFilters.inHTMLData(req.body[input]);
  });
  req.body = filteredBody;
  next();
});

// Prevents parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Body parser (form data to req.body)
app.use(express.urlencoded({ extended: true }));

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
