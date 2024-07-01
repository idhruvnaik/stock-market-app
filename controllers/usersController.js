const db = require("../models");

const list = async (req, res) => {
  try {
    const users = await db.User.findAll();;
    res.status(200).json({ users: users });
  } catch {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { list };
