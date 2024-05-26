const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "postgres://postgres:1364@localhost:5432/natours",
);

sequelize
  .authenticate()
  .then(() => console.log("Connection has been established successfully."))
  .catch((error) => console.error("Unable to connect to the database:", error));

module.exports = sequelize;
