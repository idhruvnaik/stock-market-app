const db = require("../models/index");
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "users", // explicitly set the table name if different
    }
  );

  // Associations
  User.associate = (models) => {
    User.hasMany(models.UserWatchList, {
      foreignKey: "user_id",
      as: "watchlist",
    });
  };

  return User;
};
