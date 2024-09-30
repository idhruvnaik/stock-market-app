const constants = require("../config/constants");
const { v4: uuidv4 } = require("uuid");

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
      square_off_order_token: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "NA",
      },
    },
    {
      hooks: {
        beforeCreate: async (order, options) => {
          order.square_off_order_token = await generateUniqueToken();

          const userOrder = await sequelize.models.UserOrder.findOne({
            where: { order_token: order?.user_order_token },
          });

          if (order.quantity > userOrder.quantity) {
            throw new Error("Insufficient quantity to square off the order.");
          }

          if (
            order?.state != constants.ORDER.STATE.SELL &&
            userOrder?.state == constants.ORDER.STATE.BUY
          ) {
            throw new Error(
              "You can only place a sell square-off on the buy order."
            );
          }

          if (
            order?.state != constants.ORDER.STATE.BUY &&
            userOrder?.state == constants.ORDER.STATE.SELL
          ) {
            throw new Error(
              "You can only place a buy square-off on the sell order."
            );
          }

          userOrder.quantity -= order.quantity;
          if (userOrder.quantity == 0) {
            userOrder.status = constants.ORDER.STATUS.SQUARED_OFF;
          }
          await userOrder.save();
        },
        beforeSave: async (order, options) => {
          const userOrder = await sequelize.models.UserOrder.findOne({
            where: { order_token: order?.user_order_token },
          });

          if (order.changed("trigger_price")) {
            order.total_price = await updateTotalPrice(order);
          }

          const previousStatus = order.previous("status");
          const currentStatus = order.status;

          if (
            previousStatus == constants.ORDER.STATUS.SUCCESS &&
            currentStatus == constants.ORDER.STATUS.CANCEL
          ) {
            throw new Error("Successfull Order can not be cancelled!!");
          } else if (
            previousStatus == constants.ORDER.STATUS.PENDING &&
            currentStatus == constants.ORDER.STATUS.CANCEL
          ) {
            userOrder.quantity += order.quantity;
            if (userOrder.status == constants.ORDER.STATUS.SQUARED_OFF) {
              userOrder.status = constants.ORDER.STATUS.SUCCESS;
              userOrder.save();
            }
          }
        },
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

    const total_price = order?.quantity * order?.trigger_price;
    user.balance += total_price;
    await user.save({ transaction: options.transaction });
  }

  // ? Generate Unique Token <> Order
  async function generateUniqueToken() {
    let token;
    let tokenExists = true;

    while (tokenExists) {
      token = uuidv4();
      tokenExists = await SquareOffOrder.findOne({
        where: { square_off_order_token: token },
      });
    }

    return token;
  }

  // ? Calculate the total price
  async function updateTotalPrice(order) {
    return (order.quantity * order.trigger_price).toFixed(2) || 0;
  }

  return SquareOffOrder;
};
