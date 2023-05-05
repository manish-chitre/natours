const express = require('express');
const morgan = require('morgan');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

//1)Global Middlewares
// Set security Http headers
app.use(helmet());

//Set limiter on URL.
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour!',
});

app.use('/api/', limiter);

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); //any body larger than 10kb will be rejected.

//Data sanitization against NoSqlQuery injection
app.use(mongoSanitize());

//Data sanitization to not add html code to the fields.
app.use(xss());

//hpp
app.use(hpp({whitelist : ['duration']}));
//serving static files
app.use(express.static(`${__dirname}/public`));

// app.use('*', (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
// });
//This is mounting routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.use(globalErrorHandler);
module.exports = app;
