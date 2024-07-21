const db = require("../models");
const { placeOrderLib, listLib, cancelOrderLib } = require("../lib/order");

const placeOrder = async (req, res) => {
  try {
    const order = await placeOrderLib(
      req?.user?.tokenDetails?.unique_token,
      req.body
    );
    res.status(200).json({ content: order });
  } catch (error) {
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

const cancelOrder = async (req, res) => {
  try {
    await cancelOrderLib(req?.user?.tokenDetails?.unique_token, req.body);
    res.status(200).json({ content: "Cancelled!!!" });
  } catch (error) {
    res
      .status(error?.code || 500)
      .json({ message: error?.message || "Sorry!! Something went wrong." });
  }
};

module.exports = { placeOrder, list, cancelOrder };
