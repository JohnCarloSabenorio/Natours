const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true, // Still valid, ensures parsing the connection string properly.
    useUnifiedTopology: true // Recommended to handle connection management.
  })
  .then(() => {
    console.log('DB connection successful!');
  });

console.log('ENVIRONMENT:', process.env.NODE_ENV);
// START SERVER

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
