const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/user.model");

const AppError = require("../utils/app-error.utils");
const catchAsync = require("../utils/catch-async.utils");

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signUp = catchAsync(async (request, response, next) => {
  const { name, email, password, passwordConfirm } = request.body;
  const newUser = await User.create({ name, email, password, passwordConfirm });

  const token = signToken(newUser.id);

  response.status(200).json({
    status: "success",
    token,
    data: { user: newUser },
  });
});

exports.login = catchAsync(async (request, response, next) => {
  const { email, password } = request.body;

  // check if email and password exists
  if (!email || !password)
    return next(new AppError("Please provide email and password", 400));

  // check if user exists && password is correct
  const user = await User.scope("withPassword").findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return next(new AppError("Incorrect email or password", 401));

  // if everything is ok, sendo token to client
  const token = signToken(user.id);
  response.status(200).json({
    status: "success",
    token,
  });
});
