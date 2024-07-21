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
      user_order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "user_orders",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      quantity: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("pending", "success", "cancel"),
        allowNull: false,
        defaultValue: "pending",
      },
      mode: {
        type: Sequelize.ENUM("limit", "market", "NA"),
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
