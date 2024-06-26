const bcrypt = require("bcryptjs");
const { DataTypes } = require("sequelize");
const sequelize = require("../database/db.config");

const User = sequelize.define(
  "user",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: { msg: "Please provide a valid email" } },
    },
    photo: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.ENUM,
      values: ["user", "guide", "lead-guide", "admin"],
      defaultValue: "user",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: { args: [8], msg: "Please provide a password" } },
    },
    passwordConfirm: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        validator(value) {
          if (value !== this.password) {
            throw new Error("Passwords are not the same!");
          }
        },
      },
    },
    passwordChangedAt: { type: DataTypes.DATE },
    passwordResetToken: { type: DataTypes.STRING },
    passwordResetExpires: { type: DataTypes.DATE },
  },
  {
    tableName: "users",
    defaultScope: {
      attributes: { exclude: ["password", "passwordConfirm"] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ["password", "passwordConfirm"] },
      },
    },
  },
);

User.addHook("beforeSave", async (user) => {
  if (!user.changed("password")) return;
  user.password = await bcrypt.hash(user.password, 14);
  user.passwordConfirm = "";
  user.passwordChangedAt = Date.now() - 1000;
});

// User.sync({ alter: true });
module.exports = User;
