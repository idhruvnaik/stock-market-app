const constants = require("../config/constants");
module.exports = (sequelize, DataTypes) => {
  const SquareOffOrder = sequelize.define(
    "square_off_orders",
    {
      user_order_token: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "user_orders",
          key: "order_token",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      quantity: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("PENDING", "SUCCESS", "CANCEL"),
        allowNull: false,
        defaultValue: "PENDING",
      },
      mode: {
        type: DataTypes.ENUM("LIMIT", "MARKET", "NA"),
        allowNull: false,
        defaultValue: "NA",
      },
      state: {
        type: DataTypes.ENUM("BUY", "SELL"),
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
      hooks: {
        afterSave: async (order, options) => {
          if (!order.user_order) {
            order.user_order = await order.getUser_order();
          }
          if (
            order.changed("status") &&
            order.status == constants.ORDER.STATUS.SUCCESS
          ) {
            await addBalanceToUser(order, options);
          }
        },
      },
    }
  );

  SquareOffOrder.associate = (models) => {
    SquareOffOrder.belongsTo(models.UserOrder, {
      foreignKey: "user_order_token",
      as: "user_order",
      targetKey: "order_token",
    });
  };

  // ? Add balance to user on square off success
  async function addBalanceToUser(order, options) {
    const user = await sequelize.models.User.findOne({
      where: { unique_token: order?.user_order?.user_token },
    });

    if (!user) {
      throw new Error("User not found!!!");
    }

    const total_price = order.quantity * order.trigger_price;
    user.balance += total_price;
    await user.save({ transaction: options.transaction });
  }

  return SquareOffOrder;
};
