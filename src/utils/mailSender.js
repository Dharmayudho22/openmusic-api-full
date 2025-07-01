// src/utils/mailSender.js
const nodemailer = require('nodemailer');
const config = require('./config'); // Assuming you create config.js

const mailSender = {
  sendEmail: async ({ from, to, subject, text, attachments }) => {
    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: false, // Use 'true' if your SMTP server uses SSL/TLS
      auth: {
        user: config.smtp.user,
        pass: config.smtp.password,
      },
    });

    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      attachments,
    });
  },
};

module.exports = mailSender;
