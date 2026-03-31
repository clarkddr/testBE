const logger = require('./logger');
require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendEmail(email,filename) {
    // Configuración de Mail 
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: '"Sistema de Reporte" <admin@grupojemo.net>',
        to: email,
        subject: "Reporte de Viajes Pendientes",
        text: "Adjunto reporte de los últimos 7 días.",
        attachments: [{ path: filename }]
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info("Envío de Email exitoso");
        return true;
    } catch (error) {
        logger.error(`Error en mail: ${error.message}`);
        return false;
    }
}

module.exports = sendEmail;