const { Op } = require("sequelize");

const APIFeatures = require("../utils/api-features.utils");
const Tour = require("../models/tour.model");
const sequelize = require("../database/db.config");

exports.aliasTopCheap = (request, response, next) => {
  request.query.limit = "5";
  request.query.sort = "ratingsQuantity[DESC],price[ASC]";
  request.query.fields = "name,price,ratingsAverage,summary,difficulty";

  next();
};

exports.getAllTours = async (request, response) => {
  const features = new APIFeatures(request.query);

  try {
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
  } catch (err) {
    response.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getTour = async (request, response) => {
  const { id } = request.params;
  try {
    const tour = await Tour.findByPk(id);
    response.status(200).json({
      status: "success",
      data: { tour },
    });
  } catch (err) {
    response.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.createTour = async (request, response) => {
  try {
    const newTour = await Tour.create(request.body);

    response.status(201).json({
      status: "success",
      data: { tour: newTour },
    });
  } catch (err) {
    response.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.updateTour = async (request, response) => {
  try {
    const updatedTour = await Tour.update(request.body, {
      where: { id: request.params.id },
    });

    response.status(201).json({
      status: "success",
      data: { tour: updatedTour },
    });
  } catch (error) {
    response.status(400).json({
      status: "fail",
      message: "Invalid data set!",
    });
  }
};

exports.deleteTour = async (request, response) => {
  try {
    await Tour.destroy({
      where: { id: request.params.id },
    });

    response.status(204).json({
      status: "success",
    });
  } catch (err) {
    response.status(400).json({
      status: "fail",
      message: "Invalid data set!",
    });
  }
};

exports.getTourStats = async (request, response) => {
  try {
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
  } catch (err) {
    response.status(400).json({
      status: "fail",
      message: "Invalid data set!",
    });
  }
};
