const db = require("../models");

const placeOrder = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const unique_token = req?.user?.tokenDetails?.unique_token;
    const { symbol, symbol_token, status, state, quantity, lot_size, price } =
      req.body;

    const total_price = parseFloat(price * quantity).toFixed(2) || 0;
    if (!total_price) {
      throw new Error("Something went wrong with the price...");
    }

    const order = await db.UserOrder.create({
      symbol: symbol,
      symbol_token: symbol_token,
      status: status,
      state: state,
      quantity: quantity,
      lot_size: lot_size,
      total_price: total_price,
      user_token: unique_token,
    });

    await t.commit();
    res.status(200).json({ content: order });
  } catch (error) {
    console.log(error);
    await t.rollback();
    res
      .status(error?.code || 500)
      .json({ message: error?.message || "Sorry!! Something went wrong." });
  }
};

const list = async (req, res) => {
  try {
    const unique_token = req?.user?.tokenDetails?.unique_token;
    const { status, state } = req.body;

    const orders = await db.UserOrder.findAll({
      where: { user_token: unique_token, status: status, state: state },
    });

    res.status(200).json({ content: orders });
  } catch (error) {
    res
      .status(error?.code || 500)
      .json({ message: error?.message || "Sorry!! Something went wrong." });
  }
};

module.exports = { placeOrder, list };
