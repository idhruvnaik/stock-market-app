const constants = require("../config/constants");
const db = require("../models");
const moment = require("moment");

const placeOrderLib = async (unique_token, params) => {
  const t = await db.sequelize.transaction();
  try {
    const {
      symbol,
      symbol_token,
      status,
      state,
      quantity,
      lot_size,
      price,
      mode,
      expiry,
    } = params;

    const expiry_date = moment(expiry, "DDMMMYYYY");

    let trigger_price = 0;
    if (mode == constants.ORDER.MODE.MARKET) {
      trigger_price = price || getLtpData();
    } else if (mode == constants.ORDER.MODE.LIMIT) {
      // Add it for websocket
    }

    const order = await db.UserOrder.create({
      symbol: symbol,
      symbol_token: symbol_token,
      status: status,
      state: state,
      quantity: quantity,
      lot_size: lot_size,
      user_token: unique_token,
      reference_price: price,
      trigger_price: trigger_price,
      mode: mode,
      expiry_date: expiry_date,
    });

    return order;
  } catch (error) {
    await t.rollback();
    throw new Error(error);
  }
};

const cancelOrderLib = async (unique_token, params) => {
  const t = await db.sequelize.transaction();
  try {
    const { order_token } = params;

    const order = await db.UserOrder.findOne({
      order_token: order_token,
      status: constants.ORDER.STATUS.PENDING,
    });

    if (!order) {
      throw new Error("Order does not exist!!!");
    } else {
      order.status = constants.ORDER.STATUS.CANCEL;
      order.save();
    }

    return order;
  } catch (error) {
    await t.rollback();
    throw new Error(error);
  }
};

const listLib = async () => {};

const getLtpData = async () => {
  return 100;
};

module.exports = { placeOrderLib, listLib, getLtpData, cancelOrderLib };
