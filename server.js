const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const mongoose = require('mongoose');

const app = require('./app');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});

const DB = process.env.DATABASE.replace(
  '<DATABASE_PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, { autoIndex: true }).then((con) => {
  console.log(con.connections);
  console.log('DB connection successful');
});

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err);
  console.log(err.name, err.message);
  console.log('UNHANDLER REJECTION! * SHUTTING DOWN...');
  server.close(() => {
    process.exit(1); //0-success //1-exception
  });
});
