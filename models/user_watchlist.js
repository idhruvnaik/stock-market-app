const db = require("../models/index");
module.exports = (sequelize, DataTypes) => {
  const UserWatchList = sequelize.define(
    "UserWatchList",
    {
      symbol: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_token: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "users",
          key: "unique_token",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      symbol_token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      symbol_raw_data: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
    },
    {
      tableName: "user_watchlists",
      indexes: [
        {
          unique: true,
          fields: ["user_token", "symbol"],
        },
      ],
    }
  );

  UserWatchList.associate = (models) => {
    UserWatchList.belongsTo(models.User, {
      foreignKey: "user_token",
      as: "user",
      sourceKey: "unique_token",
    });
  };

  return UserWatchList;
};
