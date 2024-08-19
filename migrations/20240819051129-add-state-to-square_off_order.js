"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("square_off_orders", "state", {
      type: Sequelize.ENUM("BUY", "SELL"),
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("square_off_orders", "state");
    await queryInterface.sequelize.query(
      'DROP TYPE "enum_square_off_orders_state";'
    );
  },
};
