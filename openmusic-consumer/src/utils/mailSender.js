const nodemailer = require('nodemailer');
const config = require('./config');

const mailSender = {
  sendEmail: async ({ from, to, subject, text }) => {
    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.password,
      },
    });

    await transporter.sendMail({ from, to, subject, text });
  },
};

module.exports = mailSender;
