require('dotenv').config();

module.exports = {
  development: {
    username: "agenthelp",
    password: "Agenthelpdb@19",
    database: "ktrades",
    host: "ec2-13-233-129-34.ap-south-1.compute.amazonaws.com",
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