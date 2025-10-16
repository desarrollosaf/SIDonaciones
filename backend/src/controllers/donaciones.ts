import { Request, Response } from "express";
import { Op } from "sequelize";
import { Sequelize, Model, DataTypes } from 'sequelize';
import UsersSafs from '../models/saf/users';
import SUsuario from '../models/saf/s_usuario';
import Dependencia from '../models/saf/t_dependencia';
import Direccion from '../models/saf/t_direccion';
import Departamento from '../models/saf/t_departamento';
import Donaciones from '../models/donaciones';
import { dp_fum_datos_generales } from '../models/fun/dp_fum_datos_generales';
import { dp_datospersonales } from '../models/fun/dp_datospersonales';
import sequelizefun from '../database/fun';
import path from 'path';
import dotenv from "dotenv";
dotenv.config();
import { sendEmail } from '../utils/mailer';
import jwt from 'jsonwebtoken';
import PDFDocument from 'pdfkit';
import fs from 'fs';

dp_datospersonales.initModel(sequelizefun);
dp_fum_datos_generales.initModel(sequelizefun);


export const saveDonacion = async (req: Request, res: Response): Promise<any> => {
  try {
    const { body } = req;
    const limite = 3;


    const donacionExistente = await Donaciones.findOne({
      where: { rfc: body.rfc }
    });

    if (donacionExistente) {
      return res.status(400).json({
        status: 400,
        msg: "Ya existe una donacion registrada con ese RFC"
      });
    }

 

    const folio: number = Math.floor(10000000 + Math.random() * 90000000);
    const verificador: number = Math.floor(10000000 + Math.random() * 90000000);

    const donacionCreate = await Donaciones.create({
      rfc: body.rfc,
      correo: body.correo,
      telefono: body.telefono,
      cantidad: body.donativo,
      folio: folio,
      estatus: '0',
      path: '1',
      verificador: verificador
    });

    const Validacion = await dp_fum_datos_generales.findOne({
      where: { f_rfc: body.rfc },
      attributes: ["f_nombre", "f_primer_apellido", "f_segundo_apellido", "f_sexo", "f_fecha_nacimiento"]
    });

    if (!Validacion) {
      throw new Error("No se encontró información para el RFC proporcionado");
    }

    const nombreCompleto = [
      Validacion.f_nombre,
      Validacion.f_primer_apellido,
      Validacion.f_segundo_apellido
    ].filter(Boolean).join(" ");

    const token = jwt.sign(
      {
        email: body.correo,
        userId: body.rfc,
      },
      process.env.JWT_SECRET || 'sUP3r_s3creT_ClavE-4321!', 
      { expiresIn: '2d' } 
    );
    const enlace = `https://dev5.siasaf.gob.mx/registro/verifica?token=${token}`;

    (async () => {
      try {
         const meses = [
            "enero", "febrero", "marzo", "abril", "mayo", "junio",
            "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
            ];
         const hoy = new Date();
         const fechaFormateada = `Toluca de Lerdo, México; a ${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}.`;
        const contenido = `
           <div class="container">
            <p  class="pderecha" >${fechaFormateada}</p>
            <p>C. ${body.rfc} ${body.rfc} ${body.rfc},</p>
            <p>Tu ayuda brinda apoyo inmediato a las familias afectadas por las intensas lluvias e inundaciones en los estados de Hidalgo, Puebla y Veracruz.  Con tu aportación, contribuimos a ofrecer alimentos, refugio, atención médica y artículos de primera necesidad a quienes más lo necesitan</p>
            <div class="credentials">
            <strong>Acepto donar la cantidad de </strong> <a href="${enlace}">$XX.00 MXN.</a>
            </div>
            <p>Otorgo mi consentimiento expreso y voluntario para que el monto indicado sea retenido de la segunda quincena de octubre del año en curso; y destinado íntegramente al fondo de apoyo a los damnificados por las lluvias en los estados de Hidalgo, Puebla y Veracruz. </p>
            <a href="https://dev5.siasaf.gob.mx/auth/login" class="button" target="_blank">Iniciar registro</a>
            <p class="footer">
              Si tiene problemas para hacer clic en el botón, copie y pegue esta URL en su navegador:<br>
               ${enlace}
            </p>
            <p>Atentamente,<br><strong>Poder Legislativo del Estado de México</strong>Este comprobante ampara un donativo voluntario, registrado a través del portal donaciones.congresoedomex.gob.mx, el cual será destinado íntegramente al fondo de apoyo para las familias afectadas por las lluvias en Hidalgo, Puebla y Veracruz</p>
          </div>
        `;
        let htmlContent = generarHtmlCorreo(contenido);
        await sendEmail(
          body.correo,
          'Tus credenciales de acceso',
           htmlContent
        );

        console.log('Correo enviado correctamente');
      } catch (err) {
        console.error('Error al enviar correo:', err);
      }
    })();


    /*const pdfBuffer = await generarPDFBuffer({
      folio: cita.folio,
      nombreCompleto: nombreCompleto,
      sexo: sexo,
      edad: edad,
      correo: body.correo,
      curp: body.rfc,
      fecha: cita.fecha_cita,
      telefono: body.telefono,
      sede: sede2,
      horario: horario,
      citaId: cita.id
    });*/

    // Enviar el PDF como respuesta al usuario
    /*res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Cita-${body.fecha_cita}.pdf"`);
    res.send(pdfBuffer);*/

    return res.json({
      status: 200,
      msg: "Donativo registrada correctamente",
    });

  } catch (error) {
    console.error('Error al guardar el registro:', error);
    return res.status(500).json({ msg: 'Error interno del servidor' });
  }
};

function generarHtmlCorreo(contenidoHtml: string): string {
  return `
    <html>
      <head>
        <style>
             body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f7;
              margin: 0;
              padding: 0;
            }
            .container {
              background-color: #ffffff;
              max-width: 600px;
              margin: 40px auto;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              padding: 30px;
            }
            h1 {
              color: #2c3e50;
              font-size: 22px;
              margin-bottom: 20px;
            }
            p {
              color: #4d4d4d;
              font-size: 16px;
              line-height: 1.5;
            }
            .credentials {
              background-color: #ecf0f1;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              font-family: monospace;
            }
            .button {
              display: inline-block;
              background-color: #007bff;
              color: white;
              padding: 12px 20px;
              text-decoration: none;
              border-radius: 6px;
              font-size: 16px;
              margin-top: 20px;
            }
            .footer {
              font-size: 12px;
              color: #999999;
              margin-top: 30px;
              text-align: center;
            }
               .pderecha{
            text-align: right;
            }
        </style>
      </head>
      <body>
        <div style="text-align: center;">
          <img 
            src="https://congresoedomex.gob.mx/storage/images/congreso.png" 
            alt="Logo"
            style="display: block; margin: 0 auto; width: 300px; height: auto;"
          >
        </div>
        <div class="content">
          ${contenidoHtml}
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} SIDerechosHumanos. Todos los derechos reservados.
        </div>
      </body>
    </html>
  `;
}

export async function generarPDFBuffer(data: PDFData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ size: "LETTER", margin: 50 });
    const chunks: any[] = [];

    const pdfDir = path.join(process.cwd(), "storage/public/pdfs");
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const fileName = `acuse_${data.folio}.pdf`;
    const filePath = path.join(pdfDir, fileName);
    const relativePath = path.join("storage", "public", "pdfs", fileName);
    console.log(relativePath)
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    doc.on("data", (chunk: any) => chunks.push(chunk));
    doc.on("end", async () => {
      try {
        // Guardar la ruta del PDF en la tabla citas
        /*await Cita.update(
          { path: relativePath },
          { where: { id: data.citaId } }
        );*/


        resolve(Buffer.concat(chunks));
      } catch (error) {
        reject(error);
      }
    });
    doc.on("error", reject);

    // ===== CONTENIDO DEL PDF =====
    doc.image(path.join(__dirname, "../assets/salud_page.jpg"), 0, 0, {
      width: doc.page.width,
      height: doc.page.height,
    });

    doc.moveDown(5);
    doc
  .fontSize(18)
  .font("Helvetica-Bold")
  .fillColor("#7d0037") // ✅ Aplica el color
  .text("CAMPAÑA GRATUITA DE SALUD MASCULINA", {
    align: "center",
  })
  .fillColor("black");

    doc.moveDown(2);
    doc.font("Helvetica").fontSize(12).text(`Folio: ${data.folio}`, { align: "right" });
    doc.font("Helvetica").fontSize(12).text(`Fecha cita: ${data.fecha}`, { align: "right" });
    doc.fontSize(12)
      .font("Helvetica")
      .text(`Paciente: ${data.nombreCompleto} | Masculino | ${data.edad}`, { align: "left" })
      .text(`CURP: ${data.curp}`, { align: "left" })
      .text(`Correo electrónico: ${data.correo} | Teléfono: ${data.telefono}`, { align: "left" })
      .text(`Ubicación: ${data.sede}`, { align: "left" })
      .text(`Horario: ${data.horario}`, { align: "left" });

    doc.moveDown();
    doc.fontSize(11).text(
      "El Voluntariado del Poder Legislativo del Estado de México organiza la Campaña gratuita de salud masculina, que incluye Check up médico y la prueba de Antígeno Prostático Específico (PSA).",
      { align: "justify" }
    );

    doc.moveDown();
    doc.fontSize(11).text(
      "Para acceder a este beneficio, es indispensable presentar en el día y hora asignados la siguiente documentación:",
      { align: "justify" }
    );
    doc.moveDown();
    doc.fontSize(11).list(
      [
        "Identificación oficial: Se aceptará únicamente credencial para votar (INE) vigente o gafete oficial expedido por la Dirección de Administración y Desarrollo de Personal. Deberán presentarse en original y copia.",
      ],
      { bulletIndent: 20 }
    );
     doc.fontSize(11).text(
      "Si no se presenta alguno de estos documentos el día de la cita, no podrá realizar su examen y este se dará por perdido. Aviso de Privacidad",
      { align: "justify" }
    );

    doc.moveDown();
    doc.font("Helvetica-Bold").fontSize(10).text("Aviso de Privacidad", { align: "left" });
    doc.font("Helvetica").fontSize(9).text("Consúltalo en:", { align: "left" });
    doc.font("Helvetica")
      .fontSize(9)
      .text(
        "https://legislacion.legislativoedomex.gob.mx/storage/documentos/avisosprivacidad/expediente-clinico.pdf",
        { align: "left" }
      );

    doc.end();
  });
}
