const User = require("../models/user.model");
const catchAsync = require("../utils/catch-async.utils");

exports.getAllUsers = catchAsync(async (request, response, next) => {
  const users = await User.findAll();

  response.status(200).json({
    status: "success",
    data: { users },
  });
});

exports.createUser = catchAsync(async (request, response, next) => {
  response.status(500).json({
    status: "success",
    message: "Reponse to create users",
  });
});

exports.getUser = catchAsync(async (request, response, next) => {
  response.status(500).json({
    status: "success",
    message: "Reponse from get user",
  });
});
