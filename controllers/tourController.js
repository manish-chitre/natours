const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.Top5Economical = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = 'price';
  req.query.fields = 'name,price,difficulty';
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please check if name or body field is present',
    });
  }

  next();
};

exports.checkId = async (req, res, next, val) => {
  const tours = await Tour.find();
  if (val > tours.length) {
    return res.status(500).json({
      status: 'fail',
      message: 'More number of tours in length',
    });
  }
  next();
};

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  return res.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
});

exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .fields()
    .paging();

  const tours = await features.query;

  return res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: {
          $gte: 4.5,
        },
      },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        sumTours: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
    {
      $match: { _id: { $ne: 'EASY' } },
    },
  ]);

  return res.status(200).json({
    status: 'success',
    data: {
      tours: stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const stats = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        noOfTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]);
  return res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

// exports.updateTour = (req, res) => {
//   //To Do.
//   //1.Get id from req parameters
//   const id = req.params.id * 1;
//   console.log(id);

//   //2.FindByIndex and update the Object using req.body
//   let tour = tours.find((el) => el.id === id);

//   //3.Check if the id is valid or not valid
//   if (!tour) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'not found',
//     });
//   }

//   tour = req.body;

//   //4.Create a new tour object and infuse it with new tour..
//   // eslint-disable-next-line prefer-object-spread
//   const newTour = Object.assign({ id: id }, tour);

//   console.log(newTour);

//   tours[tours.findIndex((el) => el.id === id)] = newTour;

//   writeFileOperation(`${__dirname}/dev-data/data/tours-simple.json`, tours);

//   //4.Return the request.
//   return res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// };

exports.deleteTour = catchAsync(async (req, res, next) => {
  try {
    const tour = await Tour.deleteOne({ _id: req.params.id * 1 });
    res.status(200).status({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(403).status({
      status: 'fail',
      message: err,
    });
  }
});

// exports.updateTour = (req, res) => {

// try{

//     Tour.replaceOne();

// }
// catch(err){

// }

//   if (id > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }
//   if (x > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }

//   return res.status(200).json({
//     status: 'success',
//     data: {
//       tours: filteredTours,
//     },
//   });
// };

exports.CreateTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});
