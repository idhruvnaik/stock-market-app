"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "role", {
      type: Sequelize.ENUM,
      allowNull: false,
      values: ["ADMIN", "CLIENT"],
      defaultValue: "CLIENT",
    });

    await queryInterface.addColumn("users", "first_name", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "NA",
    });

    await queryInterface.addColumn("users", "last_name", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "NA",
    });

    await queryInterface.addColumn("users", "email", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "role", {
      type: Sequelize.ENUM,
      allowNull: false,
      values: ["ADMIN", "CLIENT"],
    });

    await queryInterface.removeColumn("users", "first_name", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.removeColumn("users", "last_name", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.removeColumn("users", "email", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
