"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("user_watchlists", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      symbol: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_token: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'users',
          key: 'unique_token',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      symbol_token: {
        type: Sequelize.STRING,
        allowNull: false
      },
      symbol_raw_data: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {},
};
