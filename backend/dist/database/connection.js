"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize('adminplem_saf', 'usr_vacunacion', 'CFxV9IWBwUuu6KSFEUh0', {
    host: '192.168.36.53',
    dialect: 'mysql',
    define: {
        freezeTableName: true
    }
});
exports.default = sequelize;
