const db = require("../models");

const profile = async (req, res) => {
  try {
    const user = await db.User.findOne({
      where: { unique_token: req?.user?.tokenDetails?.unique_token },
    });

    res.status(200).json({
      contents: {
        username: user?.username,
        status: user?.status,
        balance: user?.balance?.toFixed(2) || 0,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { profile };
