"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("square_off_orders", "lot_size");
  },

  async down(queryInterface, Sequelize) {},
};
