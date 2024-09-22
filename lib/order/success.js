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
      const object = await ltpData([order?.symbol_token]);

      if (object?.status == true) {
        price = object?.data?.fetched[0]?.ltp || 0;
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
    await authorize();

    const orders = await db.SquareOffOrder.findAll({
      where: { status: params?.status },
      include: [
        {
          model: db.UserOrder,
          as: "user_order",
          where: {
            user_token: unique_token,
          },
          required: true,
        },
      ],
    });

    const tokens = orders?.map((item) => item?.user_order?.symbol_token);
    const object = await ltpData(tokens);

    let lastTradedPrices = [];
    if (object?.status) {
      lastTradedPrices = object?.data?.fetched;
    }

    const result = await Promise.all(
      orders?.map(async (order) => {
        const ltpData = lastTradedPrices.find(
          (price) => price?.symbolToken === order?.user_order?.symbol_token
        );
        order.last_traded_price = ltpData?.ltp || 0;

        return formatOrder(order);
      })
    );

    return result;
  } catch (error) {
    await t.rollback();
    throw new Error(error);
  }
};

const updateOrderLib = async (params) => {
  const t = await db.sequelize.transaction();
  try {
    const { square_off_order_token, reference_price, quantity, mode } = params;

    const order = await db.SquareOffOrder.findOne({
      where: {
        square_off_order_token: square_off_order_token,
        status: constants.ORDER.STATUS.PENDING,
      },
      include: [
        {
          model: db.UserOrder,
          as: "user_order",
          required: true,
        },
      ],
    });

    if (!order) {
      throw new Error("Order does not exist in pending state !!!");
    } else {
      if (mode == constants.ORDER.MODE.LIMIT) {
        order.update({
          reference_price: reference_price,
          quantity: quantity,
          mode: mode,
        });
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
          status: constants.ORDER.STATUS.SUCCESS,
          mode: mode,
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

function formatOrder(order) {
  return {
    user_order_token: order?.user_order_token,
    quantity: order?.quantity,
    lot_size: order?.lot_size,
    status: order?.status,
    mode: order?.mode,
    state: order?.state,
    reference_price: order?.reference_price,
    trigger_price: order?.trigger_price,
    total_price: order?.total_price,
    square_off_order_token: order?.square_off_order_token,
    last_traded_price: order?.last_traded_price,
    symbol: order?.user_order?.symbol,
    symbol_token: order?.user_order?.symbol_token,
  };
}

module.exports = { squareOffOrderLib, canceLib, listLib, updateOrderLib };
