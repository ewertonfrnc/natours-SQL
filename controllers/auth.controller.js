const { promisify } = require("util");
const crypto = require("crypto");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/user.model");

const AppError = require("../utils/app-error.utils");
const catchAsync = require("../utils/catch-async.utils");
const sendEmail = require("../utils/email");
const { Op } = require("sequelize");

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signUp = catchAsync(async (request, response, next) => {
  const { name, email, password, passwordConfirm, passwordChangedAt, role } =
    request.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    passwordChangedAt,
    role,
  });

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

exports.restrictTo = (...roles) =>
  catchAsync(async (request, response, next) => {
    if (!roles.includes(request.user.role))
      return next(
        new AppError("You do not have permission to perform this action.", 403),
      );

    next();
  });

exports.forgotPassword = catchAsync(async (request, response, next) => {
  // Get user based on POSTed email
  const user = await User.findOne({ where: { email: request.body.email } });

  if (!user)
    return next(new AppError("There is no user with this email address.", 404));

  // Generate random reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  await user.save({ validate: false });

  // Send it back to user as email
  const resetURL = `${request.protocol}://${request.get("host")}/api/v1/users/reset-password/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message: `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this.`,
    });

    response.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validate: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (request, response, next) => {
  // Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(request.params.token)
    .digest("hex");

  const user = await User.findOne({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { [Op.gt]: Date.now() },
    },
  });

  //  If token has not expired, and there is user, set the new password
  if (!user) return next(new AppError("Token is invalid or has expired.", 400));
  user.password = request.body.password;
  user.passwordConfirm = request.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.update();

  // Update changedPasswordAt property for the user
  // Log the user in, send JWT
  const token = signToken(user.id);
  response.status(200).json({
    status: "success",
    token,
  });
});
