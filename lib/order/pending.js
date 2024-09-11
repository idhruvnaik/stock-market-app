const constants = require("../../config/constants");
const db = require("../../models");
const moment = require("moment");
const { authorize, ltpData } = require("../angel-one");

const placeOrderLib = async (unique_token, params) => {
  const t = await db.sequelize.transaction();
  try {
    const {
      symbol,
      symbol_token,
      state,
      quantity,
      lot_size,
      price,
      mode,
      expiry,
      raw,
    } = params;

    const expiry_date = moment(expiry, "DDMMMYYYY");

    let trigger_price = 0;
    if (mode == constants.ORDER.MODE.MARKET) {
      await authorize();
      trigger_price = price;

      const object = await ltpData([symbol_token]);
      if (object?.status == true)
        trigger_price = object?.data?.fetched[0]?.ltp || 0;
    }

    const order = await db.UserOrder.create({
      symbol: symbol,
      symbol_token: symbol_token,
      state: state,
      quantity: quantity,
      lot_size: lot_size,
      user_token: unique_token,
      reference_price: price,
      trigger_price: trigger_price,
      mode: mode,
      expiry_date: expiry_date,
      symbol_raw_data: raw,
    });

    return order;
  } catch (error) {
    await t.rollback();
    throw Error(error);
  }
};

const updateOrderLib = async (params) => {
  const t = await db.sequelize.transaction();
  try {
    const { order_token, reference_price, quantity, mode, trigger_price } =
      params;
    const order = await db.UserOrder.findOne({
      where: {
        order_token: order_token,
        status: constants.ORDER.STATUS.PENDING,
      },
    });

    if (!order) {
      throw new Error("Order does not exist in pending state !!!");
    } else {
      if (mode == constants.ORDER.MODE.LIMIT) {
        order.update({ reference_price: reference_price, quantity: quantity });
      } else if (mode == constants.ORDER.MODE.MARKET) {
        await authorize();

        let price = reference_price;

        const object = await ltpData([order?.symbol_token]);

        if (object?.status == true) {
          price = object?.data?.fetched[0]?.ltp || 0;
        }

        order.update({
          reference_price: price,
          trigger_price: price,
          quantity: quantity,
        });
      }

      t.commit();
    }

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
      where: {
        order_token: order_token,
        status: constants.ORDER.STATUS.PENDING,
      },
    });

    if (!order) {
      throw new Error("Order does not exist!!!");
    } else {
      order.status = constants.ORDER.STATUS.CANCEL;
      await order.save();
    }

    return orderFormatter(order);
  } catch (error) {
    await t.rollback();
    throw new Error(error);
  }
};

const listLib = async (unique_token, params) => {
  let result = [];
  const orders = await db.UserOrder.findAll({
    where: { user_token: unique_token, status: params?.status },
    order: [["createdAt", "ASC"]],
  });

  result = await Promise.all(
    orders?.map(async (order) => {
      return orderFormatter(order);
    })
  );

  return result;
};

module.exports = { placeOrderLib, listLib, cancelOrderLib, updateOrderLib };

// !!! Private Methods

function orderFormatter(order) {
  return {
    symbol: order?.symbol,
    name: order.symbol_raw_data.name,
    symbol_token: order?.symbol_token,
    status: order?.status,
    quantity: order?.quantity,
    lot_size: order?.lot_size,
    reference_price: order?.reference_price,
    order_token: order?.order_token,
    expiry_date: order?.expiry_date,
    total_price: order?.total_price,
    placed_on: order?.createdAt,
    state: order?.state,
    mode: order?.mode,
    user_token: order?.user_token,
  };
}
