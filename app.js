const morgan = require("morgan");
const express = require("express");

const globalErrorHandler = require("./controllers/error.controller");
const tourRouter = require("./routes/tour.routes");
const userRouter = require("./routes/user.routes");

const AppError = require("./utils/app-error.utils");

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (request, response, next) => {
  next(new AppError(`Can't find ${request.originalUrl} on this server.`));
});

app.use(globalErrorHandler);

module.exports = app;
