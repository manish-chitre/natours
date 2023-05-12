const mongoose = require('mongoose');
const reviewSchema = mongoose.Schema(
  {
  review: {
    type: String,
    required: [true, 'review must be provided'],
  },
  rating: {
    type: Number,
    required: [true, 'rating must be provided'],
  },
  createdAt: {
    type: String,
    default: new Date().toDateString(),
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'tour id must be provided'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'user id must be provided'],
  },
});

reviewSchema.pre(/^find/, function (next) {
  this.populate([{ path: 'tour' }, { path: 'user' }]);
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
