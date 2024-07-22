"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("square_off_orders", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_order_token: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "user_orders",
          key: "order_token",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      quantity: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("PENDING", "SUCCESS", "CANCEL"),
        allowNull: false,
        defaultValue: "PENDING",
      },
      mode: {
        type: Sequelize.ENUM("LIMIT", "MARKET", "NA"),
        allowNull: false,
        defaultValue: "NA",
      },
      price: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {},
};
