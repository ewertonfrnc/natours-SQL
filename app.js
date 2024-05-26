const morgan = require("morgan");
const express = require("express");

const tourRouter = require("./routes/tour.routes");
const userRouter = require("./routes/user.routes");

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

module.exports = app;
