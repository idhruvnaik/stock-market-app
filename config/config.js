require('dotenv').config();

module.exports = {
  development: {
    username: "postgres",
    password: "dnaff97devlopment",
    database: "stock-market-app-development",
    host: "stock-market-app-development.c9kyq24i6e1d.ap-south-1.rds.amazonaws.com",
    dialect: 'postgres',
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
  },
};