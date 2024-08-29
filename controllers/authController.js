const bcrypt = require("bcryptjs");
const db = require("../models");
const tokens = require("../utils/tokenUtil");
const constants = require("../config/constants");

const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.User.create({ username, password: hashedPassword });
    res.status(201).json({ user: { unique_token: user?.unique_token } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.User.findOne({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user?.status === constants.USER.STATUS.INACTIVE) {
      return res.status(401).json({ message: "Account deactivated!!!" });
    }

    const { accessToken } = await tokens.generateAccessToken(user);
    const { refreshToken } = await tokens.generateRefreshToken(user);

    res.json({
      accessToken: accessToken,
      refreshToken: refreshToken,
      role: user?.role,
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const verifyRefreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await tokens.verifyRefreshToken(refreshToken);

    if (result?.error) {
      return res.status(401).json({ message: "Unauthorized!!!!" });
    } else {
      const { accessToken } = await tokens.generateAccessToken({
        unique_token: result?.tokenDetails?.unique_token,
      });
      return res.status(200).json({ accessToken: accessToken });
    }
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

module.exports = { register, login, verifyRefreshToken };
