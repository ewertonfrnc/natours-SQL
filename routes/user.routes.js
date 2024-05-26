const express = require("express");
const usersController = require("../controllers/users.controller");

const userRouter = express.Router();

userRouter
  .route("/")
  .get(usersController.getAllUsers)
  .post(usersController.createUser);
userRouter.route("/:id").get(usersController.getUser);

module.exports = userRouter;
