// src/routes/exports.js
const { postExportPlaylistsHandler } = require('../handlers/exports');

module.exports = [
  {
    method: 'POST',
    path: '/export/playlists/{playlistId}',
    handler: postExportPlaylistsHandler,
  },
];
