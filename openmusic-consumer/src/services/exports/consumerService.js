const amqp = require('amqplib');
const config = require('../../utils/config');
const mailSender = require('../../utils/mailSender');

const ConsumerService = {
  init: async () => {
    const connection = await amqp.connect(config.rabbitMq.server);
    const channel = await connection.createChannel();
    await channel.assertQueue('export:playlists', { durable: true });

    channel.consume('export:playlists', async (message) => {
      const { playlistId, targetEmail } = JSON.parse(message.content.toString());
      // Logic to fetch playlist data and send email
      await mailSender.sendEmail({
        from: config.smtp.user,
        to: targetEmail,
        subject: 'Export Playlist',
        text: `Playlist ID: ${playlistId}`,
      });
      channel.ack(message);
    });
  },
};

module.exports = ConsumerService;
