"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("login_histories", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_token: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "users",
          key: "unique_token",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      login_time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      ip_address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      device_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      operating_system: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {},
};
