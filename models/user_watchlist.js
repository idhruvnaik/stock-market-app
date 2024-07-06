const db = require("../models/index");
module.exports = (sequelize, DataTypes) => {
  const UserWatchList = sequelize.define(
    "UserWatchList",
    {
      symbol: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "user_watchlists", // explicitly set the table name if different
    }
  );

  UserWatchList.associate = (models) => {
    UserWatchList.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
  };

  return UserWatchList;
};
