const constants = require("../config/constants");
const db = require("../models");
const bcrypt = require("bcryptjs");

const profile = async (req, res) => {
  try {
    const user = await db.User.findOne({
      where: { unique_token: req?.user?.tokenDetails?.unique_token },
    });

    res.status(200).json({
      contents: {
        first_name: user?.first_name,
        last_name: user?.last_name,
        email: user?.email,
        username: user?.username,
        status: user?.status,
        balance: user?.balance?.toFixed(2) || 0,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const create = async (req, res) => {
  try {
    if (req?.user?.tokenDetails?.role != constants.ROLE.ADMIN) {
      throw new Error("You are not authorizes to perform this action!!");
    }

    const { first_name, last_name, email, password, username, role, balance } =
      req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.User.create({
      first_name: first_name,
      last_name: last_name,
      role: role,
      username: username,
      password: hashedPassword,
      email: email,
      balance: balance,
    });

    res.status(200).json({
      contents: {
        unique_token: user?.unique_token,
        first_name: user?.first_name,
        last_name: user?.last_name,
        email: user?.email,
        username: user?.username,
        status: user?.status,
        balance: user?.balance?.toFixed(2) || 0,
      },
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      res.status(400).json({
        error: "Validation Error",
        message: error.errors[0]?.message || "",
      });
    } else {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: error.message });
    }
  }
};

const update = async (req, res) => {
  try {
    if (req?.user?.tokenDetails?.role != constants.ROLE.ADMIN) {
      throw new Error("You are not authorizes to perform this action!!");
    }

    const {
      unique_token,
      first_name,
      last_name,
      email,
      balance,
      status,
      password,
    } = req.body;

    const user = await db.User.findOne({
      where: { unique_token: unique_token },
    });

    if (!user) {
      throw new Error("User not found!!");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.update({
      first_name: first_name,
      last_name: last_name,
      email: email,
      balance: balance,
      status: status,
      password: hashedPassword,
    });

    res.status(200).json({
      contents: {
        first_name: user?.first_name,
        last_name: user?.last_name,
        email: user?.email,
        status: user?.status,
        balance: user?.balance?.toFixed(2) || 0,
      },
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      res.status(400).json({
        error: "Validation Error",
        message: error.errors[0]?.message || "",
      });
    } else {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: error.message });
    }
  }
};

const list = async (req, res) => {
  try {
    if (req?.user?.tokenDetails?.role != constants.ROLE.ADMIN) {
      throw new Error("You are not authorizes to perform this action!!");
    }

    let list = [];
    const users = await db.User.findAll();

    users?.forEach((user) => {
      list.push({
        first_name: user?.first_name,
        last_name: user?.last_name,
        status: user?.status,
        balance: user?.balance,
        username: user?.username,
        email: user?.email,
      });
    });

    res.status(200).json({ list: list });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

const login_history = async (req, res) => {
  try {
    const histories = await db.LoginHistory.findAll({
      where: {
        user_token: req?.user?.tokenDetails?.unique_token,
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ histories: histories });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

module.exports = { profile, create, update, list, login_history };
