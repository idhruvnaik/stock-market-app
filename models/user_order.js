module.exports = (sequelize, DataTypes) => {
  const UserOrder = sequelize.define(
    "UserOrder",
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
      status: {
        type: DataTypes.ENUM("pending", "success", "cancel"),
        allowNull: false,
        defaultValue: "pending",
      },
      state: {
        type: DataTypes.ENUM("buy", "sell", "NA"),
        allowNull: false,
        defaultValue: "NA",
      },
      quantity: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      lot_size: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      total_price: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
    },
    {
      tableName: "user_orders",
      hooks: {
        beforeCreate: async (userOrder, options) => {
          const user = await sequelize.models.User.findOne({
            where: { unique_token: userOrder.user_token },
          });

          if (!user) {
            throw new Error("User not found!!!");
          }

          if (user.balance < userOrder.total_price) {
            throw new Error("Insufficient balance!!!");
          }

          user.balance -= userOrder.total_price;
          await user.save({ transaction: options.transaction });
        },
      },
    }
  );

  UserOrder.associate = (models) => {
    UserOrder.belongsTo(models.User, {
      foreignKey: "user_token",
      as: "user",
      sourceKey: "unique_token",
    });
  };
  return UserOrder;
};
