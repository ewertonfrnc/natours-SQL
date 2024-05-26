const { DataTypes } = require("sequelize");
const sequelize = require("../database/db.config");

const Tour = sequelize.define(
  "tour",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    maxGroupSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    difficulty: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ratingsAverage: {
      type: DataTypes.DOUBLE,
      defaultValue: 4.5,
    },
    ratingsQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: { isNumeric: true },
    },
    priceDiscount: {
      type: DataTypes.DOUBLE,
    },
    summary: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    imageCover: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    startDates: {
      type: DataTypes.ARRAY(DataTypes.DATE),
    },
  },
  { tableName: "tours" },
);

// Tour.sync({ alter: true });
module.exports = Tour;
