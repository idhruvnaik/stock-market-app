"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex("user_watchlists", ["user_token", "symbol", "symbol_token"], {
      unique: true,
      name: "unique_user_token_symbol_symbol_token",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "user_watchlists",
      "unique_user_token_symbol"
    );
  },
};
