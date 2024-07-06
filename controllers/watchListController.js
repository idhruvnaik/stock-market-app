const db = require("../models");
const list = async (req, res) => {
  try {
    const watchlists = await db.UserWatchList.findAll({user_id: req?.body?.user_id});
    // const user = await db.User.findOne({
    //   where: { id: req?.body?.user_id },
    //   include: [
    //     {
    //       model: db.UserWatchList,
    //       as: 'watchlist'
    //     },
    //   ],
    // });
    res.status(200).json({ watchlists: watchlists });
  } catch(error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const add = async (req, res) => {
  try {
    const { user_id, symbol } = req.body;
    const object = await db.UserWatchList.create({
        user_id: user_id,
      symbol: symbol,
    });
    res.status(200).json({ symbol: object });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { list, add };
