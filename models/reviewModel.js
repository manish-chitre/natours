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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  //   this.populate([
  //     { path: 'tour', select: 'name' },
  //     { path: 'user', select: 'name photo' },
  //   ]);
  //this is populating.
  this.populate([
    {
      path: 'user',
      select: 'name photo',
    },
  ]);
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
