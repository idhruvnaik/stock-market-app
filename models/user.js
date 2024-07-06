const { v4: uuidv4 } = require("uuid");

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
    },
    {
      tableName: "users",
      hooks: {
        beforeCreate: async (user, options) => {
          let token;
          let tokenExists = true;
          console.log(user);
          while (tokenExists) {
            token = uuidv4();
            tokenExists = await User.findOne({
              where: { unique_token: token },
            });
          }

          user.unique_token = token;
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
