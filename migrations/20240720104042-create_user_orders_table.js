"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_user_orders_status" AS ENUM('PENDING', 'SUCCESS', 'CANCEL');
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_user_orders_state" AS ENUM('BUY', 'SELL', 'NA');
    `);

    await queryInterface.createTable("user_orders", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      symbol: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_token: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "users",
          key: "unique_token",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      symbol_token: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("PENDING", "SUCCESS", "CANCEL"),
        allowNull: false,
        defaultValue: "PENDING",
      },
      state: {
        type: Sequelize.ENUM("BUY", "SELL", "NA"),
        allowNull: false,
        defaultValue: "NA",
      },
      quantity: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      lot_size: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      reference_price: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      trigger_price: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      total_price: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      order_token: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {},
};
