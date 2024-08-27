const constants = require("../../config/constants");
const db = require("../../models");
const { authorize, ltpData } = require("../angel-one");

const squareOffOrder = async (unique_token, params) => {
  const t = await db.sequelize.transaction();
  try {
    let { order_token, quantity, mode, state, price } = params;

    const order = await db.UserOrder.findOne({
      where: { user_token: unique_token, order_token: order_token },
    });

    await squareOffOrderValidations(params, order);

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

      const squareOffOrderObject = await db.SquareOffOrder.create({
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
    }
  } catch (error) {
    await t.rollback();
    throw new Error(error);
  }
};

// ? Checks to place a squareoff order
async function squareOffOrderValidations(params, order) {
  if (params?.quantity > order?.quantity) {
    throw new Error("Insufficient quantity to square off the order.");
  }

  if (
    params?.state != constants.ORDER.STATE.SELL &&
    order?.state == constants.ORDER.STATE.BUY
  ) {
    throw new Error("You can only place a sell square-off on the buy order.");
  }

  if (
    params?.state != constants.ORDER.STATE.BUY &&
    order?.state == constants.ORDER.STATE.SELL
  ) {
    throw new Error("You can only place a buy square-off on the sell order.");
  }
}

module.exports = { squareOffOrder };
