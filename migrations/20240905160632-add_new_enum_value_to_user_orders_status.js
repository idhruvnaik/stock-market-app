"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `ALTER TYPE enum_user_orders_status ADD VALUE 'SQUARED_OFF';`
    );
  },

  async down(queryInterface, Sequelize) {},
};
