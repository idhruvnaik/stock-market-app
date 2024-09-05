"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "square_off_orders",
      "square_off_order_token",
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "square_off_orders",
      "square_off_order_token"
    );
  },
};
