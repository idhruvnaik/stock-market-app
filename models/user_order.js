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
      reference_price: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      trigger_price: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      total_price: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
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
        beforeSave: async (userOrder, options) => {
          if (userOrder.changed("trigger_price")) {
            userOrder.total_price =
              (userOrder.quantity * userOrder.trigger_price).toFixed() || 0;
          }
        },
        beforeUpdate: async (userOrder, options) => {
          const currentOrder = await UserOrder.findOne({
            where: { id: userOrder.id },
            transaction: options.transaction,
          });

          if (
            currentOrder.status !== "PENDING" &&
            userOrder.status === "CANCEL"
          ) {
            throw new Error(
              "Order can only be canceled from the PENDING state"
            );
          }
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
