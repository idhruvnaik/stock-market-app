const { Sequelize, DataTypes } = require("sequelize");
const config = require("../config/config");
const UserModel = require("./user");
const UserWatchListModel = require("./user_watchlist");
const SymbolModel = require("./symbol");
const UserOrderModel = require("./user_order");
const SquareOffOrderModel = require("./square_off_order");
const LoginHistoryModel = require("./login_history");

const env = process.env.NODE_ENV || "development";
const sequelize = new Sequelize(config[env]);

const User = UserModel(sequelize, DataTypes);
const UserWatchList = UserWatchListModel(sequelize, DataTypes);
const Symbol = SymbolModel(sequelize, DataTypes);
const UserOrder = UserOrderModel(sequelize, DataTypes);
const SquareOffOrder = SquareOffOrderModel(sequelize, DataTypes);
const LoginHistory = LoginHistoryModel(sequelize, DataTypes);

User.associate({ UserWatchList });
UserWatchList.associate({ User, Symbol });
UserOrder.associate({ User, Symbol, SquareOffOrder });
SquareOffOrder.associate({ UserOrder });

const db = {
  Sequelize,
  sequelize,
  User,
  UserWatchList,
  Symbol,
  UserOrder,
  SquareOffOrder,
  LoginHistory,
};

module.exports = db;
