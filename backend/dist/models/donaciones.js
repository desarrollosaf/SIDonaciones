"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const cuestionariosConnection_1 = __importDefault(require("../database/cuestionariosConnection"));
class Donaciones extends sequelize_1.Model {
}
Donaciones.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    rfc: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    correo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    telefono: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    cantidad: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    path: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    folio: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    estatus: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pendiente',
    },
    verificador: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    verified_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: cuestionariosConnection_1.default,
    tableName: 'donaciones',
    timestamps: true,
});
exports.default = Donaciones;
