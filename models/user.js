const { v4: uuidv4 } = require("uuid");
const { Sequelize } = require("sequelize");

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
      unique_token: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM,
        values: ["active", "inactive"],
        defaultValue: "active",
        allowNull: false,
      },
      balance: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      role: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ["ADMIN", "CLIENT"],
        defaultValue: "CLIENT",
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "users",
      hooks: {
        beforeCreate: async (user, options) => {
          if (user.role === "ADMIN") {
            const existingAdmin = await User.findOne({
              where: { role: "ADMIN" },
            });

            if (existingAdmin) {
              throw new Error("Only one ADMIN is allowed.");
            }
          }

          let token;
          let tokenExists = true;
          while (tokenExists) {
            token = uuidv4();
            tokenExists = await User.findOne({
              where: { unique_token: token },
            });
          }

          user.unique_token = token;
        },
        beforeUpdate: async (user, options) => {
          if (user.role === "ADMIN") {
            const existingAdmin = await User.findOne({
              where: { role: "ADMIN", id: { [Sequelize.Op.ne]: user.id } },
            });

            if (existingAdmin) {
              throw new Error("Only one ADMIN is allowed.");
            }
          }
        },
      },
    }
  );

  // Associations
  User.associate = (models) => {
    User.hasMany(models.UserWatchList, {
      foreignKey: "user_token",
      as: "watchlist",
      sourceKey: "unique_token",
    });
  };
  return User;
};
