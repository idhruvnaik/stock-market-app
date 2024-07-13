"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("symbols", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      symbol: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      expiry: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      strike: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lotsize: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      instrumenttype: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      exch_seg: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tick_size: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("symbols");
  },
};
