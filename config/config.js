require('dotenv').config();

module.exports = {
  development: {
    username: "ktrade",
    password: "KsKtradedb@123",
    database: "ktrade",
    host: "ec2-13-127-186-148.ap-south-1.compute.amazonaws.com",
    dialect: 'postgres',
  },
  test: {
    username: "dhruvnaik",
    password: "",
    database: "ktrades",
    host: "localhost",
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