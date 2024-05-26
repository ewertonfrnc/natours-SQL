const morgan = require("morgan");
const express = require("express");

const tourRouter = require("./routes/tour.routes");
const userRouter = require("./routes/user.routes");

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (request, response, next) => {
  response.status(404).json({
    status: "fail",
    message: `Can't find ${request.originalUrl} on this server.`,
  });
});

module.exports = app;
