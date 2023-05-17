const mongoose = require('mongoose');const Tour = require('./tourModel');
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

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  console.log(tourId);
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  await Tour.findByIdAndUpdate(
    { _id: tourId },
    {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    }
  );
};

//restricts the review to be unique for both tour and user.
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.post('save', function () {
  //this points to current review
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.clone().findOne();

  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
