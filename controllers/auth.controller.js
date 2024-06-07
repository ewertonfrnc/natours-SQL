const { promisify } = require("util");

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

exports.protect = catchAsync(async (request, response, next) => {
  let token;

  // Get auth jwt token and check if it exists
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith("Bearer")
  ) {
    token = request.headers.authorization.split(" ")[1];
  }

  if (!token)
    return next(
      new AppError("Your are not logged in! Please log in to get access.", 401),
    );

  //  Verify jwt token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if user still exists
  const currentUser = await User.findByPk(decoded.id);
  if (!currentUser)
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401,
      ),
    );

  // Check if user changed password after the jwt token  was issued
  if (currentUser.passwordChangedAt) {
    const changedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10,
    );

    if (decoded.iat < changedTimestamp)
      return next(
        new AppError(
          "User recently changed password! Please log in again.",
          401,
        ),
      );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  request.user = currentUser;
  next();
});
