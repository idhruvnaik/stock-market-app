const { Sequelize } = require('sequelize');
const config = require('../config/config');
const UserModel = require('./user');
const UserWatchListModel = require('./user_watchlist');


const env = process.env.NODE_ENV || 'development';
const sequelize = new Sequelize(config[env]);

const db = { Sequelize, sequelize, User: UserModel(sequelize, Sequelize.DataTypes), UserWatchList: UserWatchListModel(sequelize, Sequelize.DataTypes) };

module.exports = db;