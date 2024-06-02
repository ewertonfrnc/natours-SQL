const express = require("express");
const usersController = require("../controllers/users.controller");
const authController = require("../controllers/auth.controller");

const userRouter = express.Router();

userRouter.route("/signup").post(authController.signUp);
userRouter.route("/login").post(authController.login);

userRouter
  .route("/")
  .get(usersController.getAllUsers)
  .post(usersController.createUser);
userRouter.route("/:id").get(usersController.getUser);

module.exports = userRouter;
