const mongoose = require('mongoose'); //const User = require('./userModel');
const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      unique: true,
      trim: true,
      maxlength: [40, 'a tour name must have less or equal then 40'],
      minlength: [10, 'a tour name must have atleast 10 characters'],
    },
    duration: {
      type: Number,
      required: [true, 'tour must have duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'tour must have max group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either : easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be less than 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 30,
    },
    price: {
      type: Number,
      required: [true, 'price is required'],
    },
    summary: {
      type: String,
      required: [true, 'summary must be required'],
    },
    description: {
      type: String,
      required: [true, 'tour require description'],
    },
    imageCover: {
      type: String,
      required: [true, 'tour require imageCover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      value: false,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [
        {
          type: String,
        },
      ],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [
          {
            type: String,
          },
        ],
        description: String,
        day: String,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//guides embedded
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

//guides child refrenced.
tourSchema.pre(/^find/, function (next) {
  this.populate({ path: 'guides', select: '-__v' });
  next();
});

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

const Tour = mongoose.model('Tour', tourSchema);

(async () => {
  await Tour.ensureIndexes({ name: 1, imageCover: 1 }, { unique: true });
})();

module.exports = Tour;
