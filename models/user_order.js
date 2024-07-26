const { v4: uuidv4 } = require("uuid");
const constants = require("../config/constants");
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
        type: DataTypes.ENUM("PENDING", "SUCCESS", "CANCEL"),
        allowNull: false,
        defaultValue: "PENDING",
      },
      state: {
        type: DataTypes.ENUM("BUY", "SELL", "NA"),
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
      order_token: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      expiry_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      symbol_raw_data: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      mode: {
        type: DataTypes.ENUM("LIMIT", "MARKET", "NA"),
        allowNull: false,
        defaultValue: "NA",
      },
    },
    {
      tableName: "user_orders",
      hooks: {
        beforeCreate: async (userOrder, options) => {
          userOrder.order_token = await generateUniqueToken();
          await deductBalanceFromUser(userOrder, options);
        },
        beforeSave: async (userOrder, options) => {
          if (userOrder.changed("trigger_price")) {
            userOrder.total_price = await updateTotalPrice(userOrder);
            // ? Change status of Order to Success if total price is set
            if (
              userOrder.total_price > 0 &&
              userOrder.status === constants.ORDER.STATUS.PENDING
            ) {
              userOrder.status = constants.ORDER.STATUS.SUCCESS;
            }
          }

          await orderRules(userOrder, options);
        },
        beforeDestroy: async (userOrder, options) => {
          throw new Error("Destroy operation is not permitted!!!");
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

  // ? Generate Unique Token <> Order
  async function generateUniqueToken() {
    let token;
    let tokenExists = true;
    while (tokenExists) {
      token = uuidv4();
      tokenExists = await UserOrder.findOne({
        where: { order_token: token },
      });
    }

    return token;
  }

  // ? Deduct balance from user
  async function deductBalanceFromUser(userOrder, options) {
    const user = await sequelize.models.User.findOne({
      where: { unique_token: userOrder.user_token },
    });

    if (!user) {
      throw new Error("User not found!!!");
    }

    const total_price = userOrder.quantity * userOrder.reference_price;
    if (user.balance < total_price) {
      throw new Error("Insufficient balance!!!");
    }

    user.balance -= total_price;
    await user.save({ transaction: options.transaction });
  }

  // ? Calculate the total price
  async function updateTotalPrice(userOrder) {
    return (userOrder.quantity * userOrder.trigger_price).toFixed(2) || 0;
  }

  // ? Rules <> Order
  async function orderRules(userOrder, options) {
    const previousStatus = userOrder.previous("status");
    const currentStatus = userOrder.status;

    if (
      previousStatus === constants.ORDER.STATUS.SUCCESS &&
      currentStatus === constants.ORDER.STATUS.CANCEL
    ) {
      throw new Error("Successfull Order can not be cancelled!!");
    } else if (
      previousStatus === constants.ORDER.STATUS.PENDING &&
      currentStatus === constants.ORDER.STATUS.CANCEL
    ) {
      const total_price = userOrder.quantity * userOrder.reference_price;
      const user = await sequelize.models.User.findOne({
        where: { unique_token: userOrder.user_token },
      });

      if (!user) {
        throw new Error("User not found!!!");
      }

      user.balance += total_price;
      await user.save({ transaction: options.transaction });
    }
  }

  return UserOrder;
};
