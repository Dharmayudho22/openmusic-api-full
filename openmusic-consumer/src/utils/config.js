// openmusic_consumer/src/utils/config.js
require('dotenv').config();

const config = {
  rabbitMq: {
    server: process.env.RABBITMQ_SERVER,
  },
  smtp: {
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
  },
};

module.exports = config;
