const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');

exports.addReview = catchAsync(async (req, res, next) => {
  const newReview = {
    review: req.body.review,
    rating: req.body.rating,
    tour: req.body.tour,
    user: req.body.user,
  };

  await Review.create(newReview);

  return res.status(200).json({
    status: 'success',
    data: {
      newReview,
    },
  });
});

exports.getReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();
  return res.status(200).json({
    status: 'success',
    data: {
      reviews,
    },
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById({ _id: req.params.id });
  return res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});
