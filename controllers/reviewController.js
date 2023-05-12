const Review = require('../models/reviewModel');const catchAsync = require('../utils/catchAsync');

exports.addReview = catchAsync(async (req, res, next) => {
  //Allow nested routes..
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const newReview = await Review.create(req.body);

  return res.status(200).json({
    status: 'success',
    data: {
      newReview,
    },
  });
});

exports.getReviews = catchAsync(async (req, res, next) => {
  let reviews = null;
  if (!req.params.tourId) {
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

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById({ _id: req.params.id });
  return res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});
