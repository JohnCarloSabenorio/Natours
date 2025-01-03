const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Catches synchronous errors
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! Shutting down application...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

console.log(process.env.NODE_ENV);
// SETUP MONGOOSE CONNECT
mongoose.connect(DB).then(res => {
  console.log('Database connection successful!');
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// SAFETY NET
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! Shutting down application...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

