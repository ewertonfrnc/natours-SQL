const express = require("express");
const tourController = require("../controllers/tour.controller");
const authController = require("../controllers/auth.controller");

const tourRouter = express.Router();

tourRouter
  .route("/top-tours")
  .get(tourController.aliasTopCheap, tourController.getAllTours);

tourRouter.route("/tour-stats").get(tourController.getTourStats);

tourRouter
  .route("/")
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

tourRouter
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = tourRouter;
