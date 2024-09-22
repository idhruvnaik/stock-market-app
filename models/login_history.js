const db = require("../models/index");

module.exports = (sequelize, DataTypes) => {
  const LoginHistory = sequelize.define(
    "LoginHistory",
    {
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
      login_time: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      ip_address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      device_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      operating_system: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "login_histories",
    }
  );

  LoginHistory.associate = (models) => {
    LoginHistory.belongsTo(models.User, {
      foreignKey: "user_token",
      as: "user",
      sourceKey: "unique_token",
    });
  };

  return LoginHistory;
};
