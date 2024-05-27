const { Op } = require("sequelize");

const Tour = require("../models/tour.model");
const sequelize = require("../database/db.config");

const AppError = require("../utils/app-error.utils");
const APIFeatures = require("../utils/api-features.utils");
const catchAsync = require("../utils/catch-async.utils");

exports.aliasTopCheap = (request, response, next) => {
  request.query.limit = "5";
  request.query.sort = "ratingsQuantity[DESC],price[ASC]";
  request.query.fields = "name,price,ratingsAverage,summary,difficulty";

  next();
};

exports.getAllTours = catchAsync(async (request, response, next) => {
  const features = new APIFeatures(request.query);

  const tours = await Tour.findAll({
    where: features.filter(),
    limit: features.pagination().limit,
    offset: features.pagination().offset,
    order: features.sort(),
    attributes: features.limitFields(),
  });

  response.status(200).json({
    status: "success",
    results: tours.length,
    data: { tours },
  });
});

exports.getTour = catchAsync(async (request, response, next) => {
  const tour = await Tour.findByPk(request.params.id);

  if (!tour) return next(new AppError("No tour found with that ID", 404));

  response.status(200).json({
    status: "success",
    data: { tour },
  });
});

exports.createTour = catchAsync(async (request, response, next) => {
  const newTour = await Tour.create(request.body);

  response.status(201).json({
    status: "success",
    data: { tour: newTour },
  });
});

exports.updateTour = catchAsync(async (request, response, next) => {
  const updatedTour = await Tour.update(request.body, {
    where: { id: request.params.id },
  });

  if (!updatedTour)
    return next(new AppError("No tour found with that ID", 404));

  response.status(201).json({
    status: "success",
    data: { tour: updatedTour },
  });
});

exports.deleteTour = catchAsync(async (request, response, next) => {
  const destroyedRows = await Tour.destroy({
    where: { id: request.params.id },
  });

  if (!destroyedRows)
    return next(new AppError("No tour found with that ID", 404));

  response.status(204).json({
    status: "success",
  });
});

exports.getTourStats = catchAsync(async (request, response, next) => {
  const stats = await Tour.findAll({
    attributes: [
      "difficulty",
      [sequelize.fn("COUNT", sequelize.col("id")), "numTours"],
      [sequelize.fn("SUM", sequelize.col("ratingsQuantity")), "numRatings"],
      [sequelize.fn("AVG", sequelize.col("ratingsAverage")), "avgRating"],
      [sequelize.fn("AVG", sequelize.col("price")), "avgPrice"],
      [sequelize.fn("MIN", sequelize.col("price")), "minPrice"],
      [sequelize.fn("MAX", sequelize.col("price")), "maxPrice"],
    ],
    group: ["difficulty"],
    order: [[sequelize.fn("AVG", sequelize.col("price")), "ASC"]],
  });

  response.status(200).json({
    status: "success",
    results: stats.length,
    data: { stats },
  });
});
