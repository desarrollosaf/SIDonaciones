const nodemailer = require('nodemailer');
import dotenv from 'dotenv';

dotenv.config(); // Carga las variables de entorno

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // Si usas port 465, cámbialo a true
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  attachments: any[] = []  
) => {
  try {
    await transporter.sendMail({
      from: `"COMPROBANTE DE DONATIVO" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      attachments, 
    });
    console.log(`Correo enviado a: ${to}`);
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    throw error;
  }
};