const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    console.log(req.params.id);
    const doc = await Model.findByIdAndDelete({ _id: req.params.id });
    if (!doc) {
      return next(new AppError('no document found with that ID', 404));
    }
    return res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    console.log(req.params.id);
    const updatedDoc = await Model.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true,
      }
    );

    if (!updatedDoc) {
      return next(new AppError('document with id not found', 401));
    }
    //4.Return the request.
    return res.status(201).json({
      status: 'success',
      data: updatedDoc,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    return res.status(201).json({
      status: 'success',
      data: doc,
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const query = await Model.findById(req.params.id, {
      // new: true,
      // runValidators: true,
    });

    if (popOptions) {
      query.populate(popOptions);
    }

    const doc = await query;

    if (!doc) {
      return next(new AppError('No tour found with that ID', 404));
    }

    return res.status(200).json({
      status: 'success',
      data: {
        tour: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .fields()
      .paging();

    const docs = await features.query.explain();

    if (docs.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'no documents found',
      });
    }

    return res.status(200).json({
      status: 'success',
      results: docs.length,
      data: docs,
    });
  });
