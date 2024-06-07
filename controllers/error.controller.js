const AppError = require("../utils/app-error.utils");

const sendErrorDev = (error, response) => {
  response.status(error.statusCode).json({
    error,
    status: error.status,
    message: error.message,
    stack: error.stack,
  });
};

const sendErrorProd = (error, response) => {
  if (error.isOperational) {
    response.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    // Unknown error: don't leak error details
    console.error("ERROR 💥", error);

    response.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

module.exports = (error, request, response, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development ")
    return sendErrorDev(error, response);

  if (process.env.NODE_ENV === "production ") {
    let err = { ...error };

    if (err.name === "SequelizeDatabaseError") {
      err = new AppError("Invalid ID", 400);
    }

    if (err.name === "SequelizeUniqueConstraintError") {
      err = new AppError(
        "Duplicate field value. Please use another value!",
        400,
      );
    }

    if (err.name === "SequelizeValidationError") {
      const errors = err.errors.map((el) => el.message);
      err = new AppError(`Invalid input data. ${errors.join(". ")}`, 400);
    }

    if (err.name === "JsonWebTokenError") {
      err = new AppError("Invalid token. Please log in again.", 401);
    }

    if (err.name === "TokenExpiredError") {
      err = new AppError("Your token has expired! Please log in again.", 401);
    }

    return sendErrorProd(err, response);
  }

  response.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
};
