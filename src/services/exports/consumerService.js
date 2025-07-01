// src/services/exports/consumerService.js
const amqp = require('amqplib');
const config = require('../../utils/config'); // Assuming you create config.js
const pool = require('../../database/postgres'); // Re-use your database pool
const mailSender = require('../../utils/mailSender'); // New mail sender utility

const ConsumerService = {
  init: async () => {
    try {
      const connection = await amqp.connect(config.rabbitMq.server);
      const channel = await connection.createChannel();

      await channel.assertQueue('export:playlists', {
        durable: true,
      });

      channel.consume('export:playlists', async (message) => {
        try {
          const { playlistId, targetEmail } = JSON.parse(message.content.toString());

          // Fetch playlist data with songs
          const playlistResult = await pool.query(
            `SELECT playlists.id, playlists.name, users.username
             FROM playlists
             JOIN users ON playlists.owner = users.id
             WHERE playlists.id = $1`,
            [playlistId]
          );

          if (!playlistResult.rowCount) {
            console.error(`Playlist with ID ${playlistId} not found for export.`);
            channel.ack(message);
            return;
          }

          const songsResult = await pool.query(
            `SELECT songs.id, songs.title, songs.performer
             FROM playlist_songs
             JOIN songs ON songs.id = playlist_songs.song_id
             WHERE playlist_songs.playlist_id = $1`,
            [playlistId]
          );

          const playlistData = {
            playlist: {
              id: playlistResult.rows[0].id,
              name: playlistResult.rows[0].name,
              songs: songsResult.rows,
            },
          };

          const content = JSON.stringify(playlistData, null, 2);
          const mailOptions = {
            from: config.smtp.user,
            to: targetEmail,
            subject: 'Export Playlist OpenMusic',
            text: 'Terlampir adalah daftar lagu dari playlist Anda.',
            attachments: [
              {
                filename: `playlist-${playlistId}.json`,
                content,
                contentType: 'application/json',
              },
            ],
          };

          await mailSender.sendEmail(mailOptions);
          console.log(`Playlist ${playlistId} exported to ${targetEmail}`);
          channel.ack(message); // Acknowledge message after successful processing
        } catch (error) {
          console.error('Error processing message:', error);
          // Optionally, nack the message to put it back in the queue for retry
          // channel.nack(message);
        }
      });
    } catch (error) {
      console.error('Error connecting to RabbitMQ:', error);
    }
  },
};

module.exports = ConsumerService;
