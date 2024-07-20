const { Sequelize, DataTypes } = require("sequelize");
const config = require("../config/config");
const UserModel = require("./user");
const UserWatchListModel = require("./user_watchlist");
const SymbolModel = require("./symbol");
const UserOrderModel = require("./user_order");

const env = process.env.NODE_ENV || "development";
const sequelize = new Sequelize(config[env]);

const User = UserModel(sequelize, DataTypes);
const UserWatchList = UserWatchListModel(sequelize, DataTypes);
const Symbol = SymbolModel(sequelize, DataTypes);
const UserOrder = UserOrderModel(sequelize, DataTypes);

User.associate({ UserWatchList });
UserWatchList.associate({ User });
UserOrder.associate({ User });

const db = { Sequelize, sequelize, User, UserWatchList, Symbol, UserOrder };

module.exports = db;
