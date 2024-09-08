const constants = require("../../config/constants");
const db = require("../../models");
const { authorize, ltpData } = require("../angel-one");

const squareOffOrderLib = async (unique_token, params) => {
  const t = await db.sequelize.transaction();
  try {
    let squareOffOrderObject = null;
    let { order_token, quantity, mode, state, price, lot_size } = params;

    const order = await db.UserOrder.findOne({
      where: { user_token: unique_token, order_token: order_token },
    });

    if (params?.mode == constants.ORDER.MODE.MARKET) {
      await authorize();
      const object = await ltpData(
        constants.EXCHANGES.NFO,
        order?.symbol,
        order?.symbol_token
      );

      if (object?.status == true) {
        price = object?.data?.ltp;
      }

      squareOffOrderObject = await db.SquareOffOrder.create({
        user_order_token: order?.order_token,
        quantity: quantity,
        status: constants.ORDER.STATUS.SUCCESS,
        mode: mode,
        state: state,
        reference_price: price,
        trigger_price: price,
        lot_size: lot_size,
      });

      t.commit();
      return squareOffOrderObject;
    } else {
      squareOffOrderObject = await db.SquareOffOrder.create({
        user_order_token: order?.order_token,
        quantity: quantity,
        status: constants.ORDER.STATUS.PENDING,
        mode: mode,
        state: state,
        reference_price: price,
        lot_size: lot_size,
      });

      return squareOffOrderObject;
    }
  } catch (error) {
    await t.rollback();
    throw new Error(error);
  }
};

const canceLib = async (unique_token, params) => {
  const t = await db.sequelize.transaction();
  try {
    const { square_off_order_token } = params;

    const order = await db.SquareOffOrder.findOne({
      where: {
        square_off_order_token: square_off_order_token,
        status: constants.ORDER.STATUS.PENDING,
      },
    });

    if (!order) {
      throw new Error("Order does not exist!!!");
    } else {
      order.status = constants.ORDER.STATUS.CANCEL;
      await order.save();
    }

    t.commit();
    return order;
  } catch (error) {
    console.log(error);
    await t.rollback();
    throw new Error(error);
  }
};

const listLib = async (unique_token, params) => {
  try {
    const orders = await db.SquareOffOrder.findAll({
      where: { status: constants.ORDER.STATUS.PENDING },
      include: [
        {
          model: db.UserOrder,
          as: "user_order",
          where: {
            user_token: unique_token,
          },
          attributes: [],
          required: true,
        },
      ],
      raw: true,
    });

    return orders;
  } catch (error) {
    await t.rollback();
    throw new Error(error);
  }
};

module.exports = { squareOffOrderLib, canceLib, listLib };
