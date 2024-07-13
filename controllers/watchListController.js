const db = require("../models");

const list = async (req, res) => {
  try {
    const unique_token = req?.user?.tokenDetails?.unique_token;
    const user = await db.User.findOne({
      where: { unique_token },
      include: [
        {
          model: db.UserWatchList,
          as: "watchlist",
          order: [["order", "ASC"]],
        },
      ],
    });
    res.status(200).json({ watchlist: user?.watchlist });
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

        console.log(watchListItem);
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
