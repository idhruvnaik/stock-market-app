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
    const result = await listLib(
      req?.user?.tokenDetails?.unique_token,
      req.body
    );
    res.status(200).json({ content: result });
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
