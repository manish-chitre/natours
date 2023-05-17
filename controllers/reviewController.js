const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  //Allow nested routes..
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
};

exports.getReviews = catchAsync(async (req, res, next) => {
  let reviews = null;
  console.log(req.params.tourId);

  if (req.params.tourId) {
    reviews = await Review.find({ tour: req.params.tourId });
  } else {
    reviews = await Review.find();
  }

  return res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.getReview = factory.getOne(Review);

exports.deleteReview = factory.deleteOne(Review);

exports.createReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);
