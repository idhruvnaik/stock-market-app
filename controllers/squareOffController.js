const { squareOffOrder } = require("../lib/order/success");

const placeOrder = async (req, res) => {
  try {
    const order = await squareOffOrder(
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

module.exports = { placeOrder };
