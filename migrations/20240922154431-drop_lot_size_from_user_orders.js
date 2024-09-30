"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("user_orders", "lot_size");
  },

  async down(queryInterface, Sequelize) {},
};
