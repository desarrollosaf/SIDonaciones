"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateToken = exports.saveDonacion = void 0;
exports.generarPDFBuffer = generarPDFBuffer;
const donaciones_1 = __importDefault(require("../models/donaciones"));
const dp_fum_datos_generales_1 = require("../models/fun/dp_fum_datos_generales");
const dp_datospersonales_1 = require("../models/fun/dp_datospersonales");
const fun_1 = __importDefault(require("../database/fun"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mailer_1 = require("../utils/mailer");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
dp_datospersonales_1.dp_datospersonales.initModel(fun_1.default);
dp_fum_datos_generales_1.dp_fum_datos_generales.initModel(fun_1.default);
const saveDonacion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        const limite = 3;
        const donacionExistente = yield donaciones_1.default.findOne({
            where: { rfc: body.rfc }
        });
        if (donacionExistente) {
            return res.status(400).json({
                status: 400,
                msg: "Ya existe una donacion registrada con ese RFC"
            });
        }
        const folio = Math.floor(10000000 + Math.random() * 90000000);
        const verificador = Math.floor(10000000 + Math.random() * 90000000);
        const donacionCreate = yield donaciones_1.default.create({
            rfc: body.rfc,
            correo: body.correo,
            telefono: body.telefono,
            cantidad: body.donativo,
            folio: folio,
            estatus: '0',
            path: '1',
            verificador: verificador
        });
        const Validacion = yield dp_fum_datos_generales_1.dp_fum_datos_generales.findOne({
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
        const token = jsonwebtoken_1.default.sign({
            email: body.correo,
            userId: body.rfc,
        }, process.env.JWT_SECRET || 'sUP3r_s3creT_ClavE-4321!', { expiresIn: '2d' });
        const enlace = `https://donacionescongreso.siasaf.gob.mx/registro/verifica?token=${token}`;
        (() => __awaiter(void 0, void 0, void 0, function* () {
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
            <p><strong>Estimado(a) servidor(a) público(a):</strong> ${body.rfc} ${body.rfc} ${body.rfc},</p>
            <p>Gracias por tu solidaridad. Has registrado correctamente tu <strong>aportación voluntaria</strong> en apoyo a las familias afectadas por las lluvias en <strong>Hidalgo, Puebla y Veracruz.</strong></p>
            <p>Para completar el proceso y autorizar el descuento correspondiente, es necesario que <strong>valides tu donativo</strong> haciendo clic en el siguiente enlace:</p>
            <div class="credentials">
            <strong></strong> <a href="${enlace}">🔗 Confirmar mi donativo</a>
            </div>
            <p>Tu registro se encuentra asociado al <strong>RFC ingresado en el portal</strong> y el descuento será aplicado en la <strong>segunda quincena de octubre del presente año</strong>, conforme al monto que autorizaste. Una vez confirmada la validación, el sistema <strong>emitirá automáticamente tu comprobante digital</strong>, el cual servirá como constancia oficial del donativo</p>
            <p class="footer">
              Si tiene problemas para hacer clic en el botón, copie y pegue esta URL en su navegador:<br>
               ${enlace}
            </p>
            <p>Este mensaje fue generado automáticamente por el sistema de registro del portal https://donacionescongreso.siasaf.gob.mx/. Por motivos de seguridad, el enlace de validación <strong>tendrá una vigencia de 24 horas</strong> a partir de la recepción de este correo.</p>
          </div>
        `;
                let htmlContent = generarHtmlCorreo(contenido);
                yield (0, mailer_1.sendEmail)(body.correo, 'Tus credenciales de acceso', htmlContent);
                console.log('Correo enviado correctamente');
            }
            catch (err) {
                console.error('Error al enviar correo:', err);
            }
        }))();
        const pdfBuffer = yield generarPDFBuffer({
            folio: donacionCreate.folio,
            nombreCompleto: nombreCompleto,
            correo: donacionCreate.correo,
            rfc: donacionCreate.rfc,
            telefono: donacionCreate.telefono,
            cantidad: donacionCreate.cantidad,
            donacionID: donacionCreate.id
        });
        // Enviar el PDF como respuesta al usuario
        /*res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="Cita-${body.fecha_cita}.pdf"`);
        res.send(pdfBuffer);*/
        return res.json({
            status: 200,
            donativo: donacionCreate,
            msg: "Donativo registrada correctamente",
        });
    }
    catch (error) {
        console.error('Error al guardar el registro:', error);
        return res.status(500).json({ msg: 'Error interno del servidor' });
    }
});
exports.saveDonacion = saveDonacion;
const validateToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        const donacionUpdate = yield donaciones_1.default.findOne({
            where: { rfc: body.rfc }
        });
        if (!donacionUpdate) {
            return res.status(404).json({
                status: 404,
                msg: 'Donación no encontrada para ese RFC'
            });
        }
        yield donacionUpdate.update({ estatus: 1 });
        return res.status(200).json({
            status: 200,
            msg: 'Éxito'
        });
    }
    catch (error) {
        console.error('Error validando token:', error);
        return res.status(500).json({
            status: 500,
            msg: 'Error del servidor'
        });
    }
});
exports.validateToken = validateToken;
function generarHtmlCorreo(contenidoHtml) {
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
function generarPDFBuffer(data) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const doc = new pdfkit_1.default({ size: "LETTER", margin: 50 });
            const chunks = [];
            const pdfDir = path_1.default.join(process.cwd(), "storage/public/files/pdfs");
            if (!fs_1.default.existsSync(pdfDir)) {
                fs_1.default.mkdirSync(pdfDir, { recursive: true });
            }
            const fileName = `acuse_${data.folio}.pdf`;
            const filePath = path_1.default.join(pdfDir, fileName);
            const relativePath = path_1.default.join("storage", "public", "files", "pdfs", fileName);
            console.log(relativePath);
            const writeStream = fs_1.default.createWriteStream(filePath);
            doc.pipe(writeStream);
            doc.on("data", (chunk) => chunks.push(chunk));
            doc.on("end", () => __awaiter(this, void 0, void 0, function* () {
                try {
                    // Guardar la ruta del PDF en la tabla citas
                    yield donaciones_1.default.update({ path: relativePath }, { where: { id: data.donacionID } });
                    resolve(Buffer.concat(chunks));
                }
                catch (error) {
                    reject(error);
                }
            }));
            doc.on("error", reject);
            doc.image(path_1.default.join(__dirname, "../assets/membrete_donativo.jpg"), 0, 0, {
                width: doc.page.width,
                height: doc.page.height,
            });
            doc.moveDown(7);
            doc
                .fontSize(18)
                .font("Helvetica-Bold")
                .fillColor("#7d0037")
                .text("COMPROBANTE DE DONATIVO", {
                align: "center",
            })
                .fillColor("black");
            doc.moveDown(2);
            doc.font("Helvetica").fontSize(12).text(`Folio: ${data.folio}`, { align: "right" });
            doc.fontSize(12)
                .font("Helvetica")
                .text(`Emisor: ${data.nombreCompleto} `, { align: "left" })
                .text(`Correo electrónico: ${data.correo} | Teléfono: ${data.telefono}`, { align: "left" });
            doc.moveDown();
            doc.fontSize(11).text("Tu ayuda brinda apoyo inmediato a las familias afectadas por las intensas lluvias e inundaciones en los estados de Hidalgo, Puebla y Veracruz.  Con tu aportación, contribuimos a ofrecer alimentos, refugio, atención médica y artículos de primera necesidad a quienes más lo necesitan.", { align: "justify" });
            doc.moveDown();
            doc.font('Helvetica-Bold')
                .fontSize(11)
                .text(`Acepto donar la cantidad de: $${data.cantidad} MXN.`, {
                align: "center"
            });
            doc.moveDown();
            doc.font("Helvetica").fontSize(11).text("Otorgo mi consentimiento expreso y voluntario para que el monto indicado sea retenido de la segunda quincena de octubre del año en curso; y destinado íntegramente al fondo de apoyo a los damnificados por las lluvias en los estados de Hidalgo, Puebla y Veracruz. ", { align: "justify" });
            doc.moveDown();
            doc.fontSize(11).text("Leyenda: Este comprobante ampara un donativo voluntario, registrado a través del portal donaciones.congresoedomex.gob.mx, el cual será destinado íntegramente al fondo de apoyo para las familias afectadas por las lluvias en Hidalgo, Puebla y Veracruz.", { align: "justify" });
            doc.end();
        }));
    });
}
