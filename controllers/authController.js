const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");
const tokens = require('../utils/token');

const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.User.create({ username, password: hashedPassword });
    res.status(201).json({ user: { id: user.id, username: user.username } });
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

    const { accessToken } = await tokens.generateAccessToken(user);
    const { refreshToken } = await tokens.generateRefreshToken(user);

    res.json({ accessToken: accessToken, refreshToken: refreshToken });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const verifyRefreshToken = async(req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await tokens.verifyRefreshToken(refreshToken);    

    if(result?.error) {
      return res.status(401).json({ message: "Unauthorized!!!!" });
    }else{
      const { accessToken } = await tokens.generateAccessToken({ username: result?.username, password: result?.password });
      return res.status(200).json({ accessToken: accessToken });
    }
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
}

module.exports = { register, login, verifyRefreshToken };
