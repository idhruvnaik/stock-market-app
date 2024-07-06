const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config');
const UserModel = require('./user');
const UserWatchListModel = require('./user_watchlist');


const env = process.env.NODE_ENV || 'development';
const sequelize = new Sequelize(config[env]);

const User = UserModel(sequelize, DataTypes);
const UserWatchList = UserWatchListModel(sequelize, DataTypes);

User.associate({ UserWatchList });
UserWatchList.associate({ User });

const db = { Sequelize, sequelize, User, UserWatchList };

module.exports = db;