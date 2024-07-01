const { Sequelize } = require('sequelize');
const config = require('../config/config');
const UserModel = require('./user');

const env = process.env.NODE_ENV || 'development';
const sequelize = new Sequelize(config[env]);

const db = { Sequelize, sequelize, User: UserModel(sequelize, Sequelize.DataTypes) };

module.exports = db;