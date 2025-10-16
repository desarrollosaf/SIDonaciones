import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';

class Donaciones extends Model {
  declare id: CreationOptional<number>;
  declare rfc: string;
  declare correo: string;
  declare telefono: string;
  declare cantidad: number;
  declare path: string | null;
  declare folio: string;
  declare estatus: CreationOptional<string>;
  declare verificador: string | null;
  declare verified_at: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Donaciones.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    rfc: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    folio: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    estatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pendiente',
    },
    verificador: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'donaciones',
    timestamps: true,
  }
);

export default Donaciones;