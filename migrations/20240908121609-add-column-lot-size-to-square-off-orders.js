"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("square_off_orders", "lot_size", {
      type: Sequelize.DOUBLE,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("square_off_orders", "lot_size");
  },
};
