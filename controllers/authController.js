const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendMail = require('../utils/nodeMailer');

function createSendToken(user, statusCode, res) {
  const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  console.log(process.env.JWT_COOKIE_EXPIRES_IN);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, //cookie cannot be modified by browser.
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true; //send the cookie on encrypted connection
  }

  res.cookie('jwt', jwtToken, cookieOptions);

  //user password is not shown in output.
  user.password = undefined;

  return res.status(statusCode).json({
    status: 'success',
    token: jwtToken,
    data: {
      user,
    },
  });
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1. Get user based on posted email
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide email address..', 401));
  }

  const user = await User.findOne({ email: email });

  if (!user) {
    return next(new AppError('There is no user with given address', 404));
  }
  //2. Generate the random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3. Generate the nodemailer.
  const url = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Please send the patch request to ${url}.The password will expire after 10 mins.If you not asked for reset password then ignore this mail.`;

  try {
    await sendMail({
      email: email,
      message: message,
      subject: 'Natours Password Reset - Expiring in 10 mins',
    });

    return res.status(200).json({
      status: 'success',
      message: 'token has been sent to mail',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return new AppError('There was an error sending mail to the user', 401);
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1. get user based on token
  const { token } = req.params;
  if (!token) {
    next(
      new AppError(
        'Please provide token along with request recieved in your email',
        404
      )
    );
  }
  //2. if token has not expired , and there is user set the new password
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  //3. update changedPasswordAt property for the user.
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //4. log the user in and JWT.
  createSendToken(user, 201, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;

  if (currentPassword === newPassword) {
    return next(
      new AppError(
        'Oops! password must be different from your current password..',
        400
      )
    );
  }
  const user = await User.findOne({ _id: req.user._id }).select('+password');

  if (!user || !user.comparePassword(currentPassword, user.password)) {
    return next(
      new AppError('user is not found or password is not valid', 400)
    );
  }

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;

  await user.save();

  createSendToken(user, 201, res);
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    //roles is an array. ['admin','lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You don't have permission to perform this action", 403)
      );
    }

    next();
  };

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  console.log(email);

  //1. check if email and password exists
  if (!email || !password) {
    next(new AppError('Please provide email and password', 400));
  }
  //2. check if user exists && password is correct
  const user = await User.findOne({ email: email }).select('+password');

  const isCorrect = await user.comparePassword(password, user.password);

  if (!isCorrect || !user) {
    next(new AppError('email or password is not valid', 401));
  }

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //1. Get Jwt token from headers
  let token = null;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    const { authorization } = req.headers;
    token = authorization.split(' ')[1];
  }
  if (!token) {
    next(
      new AppError('You have not logged In, Please log In to continue', 401)
    );
  }

  //2. verifiy the token using the secret.
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //3. If the token is correct then save the user and redirect to token controller.
  const currentUser = await User.findOne({ _id: decoded.id });

  if (!currentUser) {
    next(new AppError('User belonging to this token no longer exists.', 401));
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  //grant access to the protected route.
  req.user = currentUser;
  next();
});
