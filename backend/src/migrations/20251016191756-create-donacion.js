'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('donaciones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      rfc: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      correo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      telefono: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cantidad: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      path: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      folio: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      estatus: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '1',
      },
      verificador: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      fecha_registro: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      verified_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('donaciones');
  },
};