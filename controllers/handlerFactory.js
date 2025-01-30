const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
exports.deleteOne = Model =>
  catchAsync(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(
        new AppError(`No document found with the id of ${req.params.id}`, 404)
      );
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res) => {
    console.log('HAHAAHAHAH');
    console.log('UDPATE BODY:', req.body);
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(
        new AppError(`No doc found with the id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc: doc
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: doc
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) {
      query = query.populate(popOptions);
    }
    const doc = await query;

    if (!doc) {
      return next(
        new AppError(`No document found with the id of ${req.params.id}`, 404)
      );
    }
    res.status(200).json({
      status: 'success',
      data: doc
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res) => {
    let filter = {};

    // Filters the query for a specific tour
    if (req.params.tourId) {
      console.log('Filtered!');
      filter.tour = req.params.tourId;
    }

    // EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const docs = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: docs
    });
  });
