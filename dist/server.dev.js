"use strict";

var mongoose = require('mongoose'); // Needed for reading .env variables


var dotenv = require('dotenv'); // Catches synchronous errors


process.on('uncaughtException', function (err) {
  console.log('UNCAUGHT EXCEPTION! Shutting down application...');
  console.log(err.name, err.message);
  process.exit(1);
});
dotenv.config({
  path: './config.env'
});

var app = require('./app');

var DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
console.log(process.env.NODE_ENV); // SETUP MONGOOSE CONNECT

mongoose.connect(DB).then(function (res) {
  console.log('Database connection successful!');
});
var port = process.env.PORT || 3000;
var server = app.listen(port, function () {
  console.log("App running on port ".concat(port, "..."));
}); // SAFETY NET

process.on('unhandledRejection', function (err) {
  console.log('UNHANDLED REJECTION! Shutting down application...');
  console.log(err.name, err.message);
  server.close(function () {
    process.exit(1);
  });
});