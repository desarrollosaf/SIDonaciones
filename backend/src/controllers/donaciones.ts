import { Request, Response } from "express";
import { Op } from "sequelize";
import { Sequelize, Model, DataTypes } from 'sequelize';
import UsersSafs from '../models/saf/users';
import SUsuario from '../models/saf/s_usuario';
import Dependencia from '../models/saf/t_dependencia';
import Direccion from '../models/saf/t_direccion';
import Departamento from '../models/saf/t_departamento';
import { dp_fum_datos_generales } from '../models/fun/dp_fum_datos_generales';
import { dp_datospersonales } from '../models/fun/dp_datospersonales';
import sequelizefun from '../database/fun';
import path from 'path';

dp_datospersonales.initModel(sequelizefun);
dp_fum_datos_generales.initModel(sequelizefun);


export const saveDonacion = async (req: Request, res: Response): Promise<any> => {
  try {
    
 
console.log('oli');
    return res.json({ horarios: 'hola' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener horarios disponibles" });
  }
};
