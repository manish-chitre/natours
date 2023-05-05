const AppError = require('../utils/appError');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

exports.createAllUsers = (req, res) =>
  res.status(500).json({
    status: 'fail',
    message: 'not implemented',
  });

exports.createUser = (req, res) =>
  res.status(500).json({
    status: 'fail',
    message: 'not implemented',
  });

exports.deleteMe = catchAsync(async (req, res, next) => {
  //console.log('This is what is it ', req.user.id);
  const user = await User.findByIdAndUpdate(
    { _id: '644116d2d9054535e28d75d8' },
    { active: false },
    { new: true }
  );
  console.log(`this is something very worth ${user}`);
  return res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log('This is several on the request..');
  console.log(req.body);
  //1. create error if user Posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates, please use /updatePassword'
      ),
      400
    );
  }
  //2. update user document.
  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: req.body },
    { new: true }
  );

  return res.status(200).json({
    status: 'success',
    data: user,
  });
});

exports.getUser = (req, res) =>
  res.status(500).json({
    status: 'fail',
    message: 'not implemented',
  });
