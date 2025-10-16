import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import User from '../models/saf/users'
import UserBase from '../models/user'
import UsersSafs from '../models/saf/s_usuario'
import jwt, { JwtPayload } from 'jsonwebtoken';
import SUsuario from '../models/saf/s_usuario';
import dotenv from 'dotenv';
import { dp_fum_datos_generales } from '../models/fun/dp_fum_datos_generales'
import Cita from '../models/citas'
import Donaciones from '../models/donaciones'
export const ReadUser = async (req: Request, res: Response): Promise<any> => {
    const listUser = await User.findAll();
    return res.json({
        msg: `List de categoría encontrada exitosamenteeeee`,
        data: listUser
    });
}



export const LoginUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { rfc, password } = req.body;
    let passwordValid = false;
    let user: any = null;
    let bandera = true;




    if (rfc.startsWith('VC')) {
        bandera = false;
        user = await UserBase.findOne({
            where: { name: rfc },
        })
        if (!user) {
            return res.status(400).json({
                msg: `Usuario no existe con el rfc ${rfc}`
            })
        }
        passwordValid = await bcrypt.compare(password, user.password);
    } else {
        const asesor = await SUsuario.findOne({
            where: { N_Usuario: rfc },
            attributes: [
                "Puesto",
            ],
            raw: true
        });

        if (!asesor || (asesor.id_Dependencia === 1 && asesor.Puesto && asesor.Puesto.toUpperCase().includes("ASESOR"))) {
            return res.status(400).json({
                msg: `Este rfc es de un asesor ${rfc}`
            });
        }
 
        user = await User.findOne({
            where: { rfc: rfc },
            include: [
                {
                    model: UsersSafs,
                    as: 'datos_user',
                },
            ],
        })
        console.log(user.datos_user)
        if (!user) {
            return res.status(400).json({
                msg: `Usuario no existe con el rfc ${rfc}`
            })
        }

        const hash = user.password.replace(/^\$2y\$/, '$2b$');
        passwordValid = await bcrypt.compare(password, hash);

    }

    if (!passwordValid) {
        return res.status(402).json({
            msg: `Password Incorrecto => ${password}`
        })
    }
 
    const donacionUser = await Donaciones.findOne({
        where: { rfc: rfc }
    });


    const accessToken = jwt.sign(
        { rfc: rfc },
        process.env.SECRET_KEY || 'TSE-Poder-legislativo',
        { expiresIn: '2h' }
    );


    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 2 * 60 * 60 * 1000,
        path: '/',
    });

    return res.json({ user, bandera })
}

export const getCurrentUser = (req: Request, res: Response) => {
    const user = (req as any).user;
    res.json({
        rfc: user.rfc,
    });
};

export const cerrarsesion = async (req: Request, res: Response): Promise<any> => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    });

    return res.status(200).json({ message: 'Sesión cerrada' });
};








