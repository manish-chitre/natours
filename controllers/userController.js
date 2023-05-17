const AppError = require('../utils/appError');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllUsers = factory.getAll(User);

exports.deleteMe = factory.deleteOne(User);

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

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getUser = factory.getOne(User);
