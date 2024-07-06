const db = require("../models");
const list = async (req, res) => {
  try {
    const unique_token = req?.user?.tokenDetails?.unique_token;
    console.log(unique_token);
    const user = await db.User.findOne({
      where: { unique_token },
      include: [
        {
          model: db.UserWatchList,
          as: "watchlist",
        },
      ],
    });
    res.status(200).json({ user: user });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const add = async (req, res) => {
  try {
    const unique_token = req?.user?.tokenDetails?.unique_token;
    const { symbol, symbol_token, symbol_raw_data } = req?.body;

    const object = await db.UserWatchList.create({
      user_token: unique_token,
      symbol: symbol,
      symbol_token: symbol_token,
      symbol_raw_data: symbol_raw_data,
    });
    res.status(200).json({ symbol: object });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { list, add };
