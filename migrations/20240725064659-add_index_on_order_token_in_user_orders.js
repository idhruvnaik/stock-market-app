"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex("user_orders", ["order_token"], {
      unique: true,
      name: "user_orders_order_token_idx",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "user_orders",
      "user_orders_order_token_idx"
    );
  },
};
