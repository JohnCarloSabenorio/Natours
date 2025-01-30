"use strict";

var path = require('path');

var express = require('express');

var morgan = require('morgan');

var rateLimit = require('express-rate-limit');

var helmet = require('helmet');

var mongoSanitize = require('express-mongo-sanitize'); // const xssFilters = require('xss-filters');


var hpp = require('hpp');

var cookieParser = require('cookie-parser');

var AppError = require('./utils/appError'); // DEFINE ROUTERS


var tourRouter = require('./routes/tourRoutes');

var userRouter = require('./routes/userRoutes');

var reviewRouter = require('./routes/reviewRoutes');

var viewRouter = require('./routes/viewRoutes');

var bookingRouter = require('./routes/bookingRoutes');

var globalErrorHandler = require('./controllers/errorController');

var app = express(); // GLOBAL MIDDLEWARES

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express["static"](path.join(__dirname, 'public'))); // Set security HTTP headers

app.use(helmet({
  contentSecurityPolicy: false
}));

if (process.env.NODE_ENV === 'development') {
  // Development logging
  app.use(morgan('dev'));
}

var limiter = rateLimit({
  limit: 100,
  windowMs: 60 * 60 * 1000,
  // 1 hour,
  message: 'Too many requests, please try again after 1 hour!'
}); // limit requests from the same API

app.use('/api', limiter); // Body parser (reading data from body to req.body)

app.use(express.urlencoded({
  extended: true,
  limit: '10kb'
}));
app.use(express.json({
  limit: '10kb'
}));
app.use(cookieParser()); // Data sanitization against NoSQL Query injection

app.use(mongoSanitize()); // Data sanitization against XSS (Kinda also handles nosql query injection as it converts the query to js object)
// app.use((req, res, next) => {
//   filteredBody = {};
//   Object.keys(req.body).forEach(input => {
//     filteredBody[input] = xssFilters.inHTMLData(req.body[input]);
//   });
//   req.body = filteredBody;
//   next();
// });
// Prevents parameter pollution

app.use(hpp({
  whitelist: ['duration', 'ratingsAverage', 'ratingsQuantity', 'maxGroupSize', 'difficulty', 'price']
})); // Body parser (form data to req.body)
// Sample middleware

app.use(function (req, res, next) {
  console.log('Hello from the middleware 👋'); // console.log(req.cookies);

  next();
}); // Request Time

app.use(function (req, res, next) {
  req.requestTime = new Date().toISOString();
  next();
});
/* 
1. Create view router
2. Implement router in app file
3. Move the view routes in the route file
4. Create route controller for the view route handlers
*/
// API ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.all('*', function (req, res, next) {
  // Immediately assumes that there is an error, and will skip all middleware and send it directly to global error handling middleware
  next(new AppError("Cannot find ".concat(req.originalUrl, " on the server!"), 404));
});
app.use(globalErrorHandler);
module.exports = app;