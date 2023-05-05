const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<DATABASE_PASSWORD>',
  process.env.DATABASE_PASSWORD
);

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
);

(async () => {
  const conn = await mongoose.connect(DB);
  console.log(conn.connection);
  console.log('Database is connected successfully');
})();

//Import Data to the database
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('successfully inserted data');
  } catch (err) {
    console.log(err);
  }
};

//Delete Data from the database

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('data has been successfully deleted');
  } catch (err) {
    console.log(err);
  }
};

(async () => {
  if (process.argv[2] === '--import') {
    await importData();
  } else if (process.argv[2] === '--delete') {
    await deleteData();
  }
})();

//1. create mongodb connection string.
//2. create importData and DeleteData functions
//3. take arguments from console and call the functions accordingly.
