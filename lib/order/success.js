const constants = require("../../config/constants");
const db = require("../../models");
const { authorize, ltpData } = require("../angel-one");

const squareOffOrderLib = async (unique_token, params) => {
  const t = await db.sequelize.transaction();
  try {
    let squareOffOrderObject = null;
    let { order_token, quantity, mode, state, price } = params;

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
    t.commit();
  } catch (error) {
    await t.rollback();
    throw new Error(error);
  }
};

module.exports = { squareOffOrderLib, canceLib };
