'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('sedes', [
      {
        sede: 'Salón Narciso Bassols',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sede: 'Salón Benito Juárez',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('sedes', null, {});
  }
};

