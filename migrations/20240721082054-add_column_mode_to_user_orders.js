"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("user_orders", "mode", {
      type: Sequelize.ENUM("LIMIT", "MARKET", "NA"),
      allowNull: false,
      defaultValue: "NA",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("user_orders", "mode");
  },
};
