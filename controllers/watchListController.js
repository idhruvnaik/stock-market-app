const db = require("../models");
const { ltpData } = require("../lib/angel-one");

const list = async (req, res) => {
  try {
    let response = [];
    const unique_token = req?.user?.tokenDetails?.unique_token;
    const user = await db.User.findOne({
      where: { unique_token },
      include: [
        {
          model: db.UserWatchList,
          as: "watchlist",
        },
      ],
      order: [["watchlist", "order", "ASC"]],
    });

    const tokens = user?.watchlist?.map((item) => item?.symbol_token);
    const object = await ltpData(tokens);
    let lastTradedPrices = [];
    if (object?.status) {
      lastTradedPrices = object?.data?.fetched;
    }

    for (const watchlist of user.watchlist) {
      const ltpData = await lastTradedPrices.find(
        (price) => price?.symbolToken === watchlist?.symbol_token
      );

      response.push({
        symbol: watchlist?.symbol,
        symbol_token: watchlist?.symbol_token,
        symbol_raw_data: watchlist?.symbol_raw_data,
        last_traded_price: ltpData?.ltp || 0,
        order: watchlist?.order,
      });
    }

    res.status(200).json({ watchlist: response });
  } catch (error) {
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
    message = "";
    if (error?.name == "SequelizeUniqueConstraintError") {
      message = "Item Already Exist!!";
    }
    res.status(400).json({ message: message || "Internal Server Error" });
  }
};

const remove = async (req, res) => {
  try {
    const unique_token = req?.user?.tokenDetails?.unique_token;
    const { symbol, symbol_token } = req?.body;

    await db.UserWatchList.destroy({
      where: {
        user_token: unique_token,
        symbol: symbol,
        symbol_token: symbol_token,
      },
    });

    res.status(200).json({ message: "Deleted Successfuly!!" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const setOrder = async (req, res) => {
  try {
    const unique_token = req?.user?.tokenDetails?.unique_token;
    watchlists = req?.body?.watchlists || [];

    const t = await db.sequelize.transaction();
    watchlists?.forEach(async (element, index) => {
      if (element) {
        const watchListItem = await db.UserWatchList.findOne({
          where: {
            user_token: unique_token,
            symbol_token: element?.symbol_token,
          },
        });

        if (!watchListItem) {
          throw new Error("WatchList item not found");
        }

        await watchListItem.update({ order: index });
      }
    });

    await t.commit();
    res.status(200).json({ message: "Order Updated Successfuly!!" });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};

module.exports = { list, add, remove, setOrder };
