const { authenticate } = require('../auth/authMiddleware');
const { validateExportPlaylistPayload } = require('../validator/exportsValidator');
const ProducerService = require('../services/exports/producerService');
const { verifyPlaylistOwner } = require('../services/playlistSongs');
const Boom = require('@hapi/boom');

const postExportPlaylistsHandler = async (request, h) => {
  try {
    const userId = authenticate(request);
    const { playlistId } = request.params;
    const { targetEmail } = request.payload;

    validateExportPlaylistPayload(request.payload);

    await verifyPlaylistOwner(playlistId, userId);

    const message = JSON.stringify({ playlistId, targetEmail });
    await ProducerService.sendMessage('export:playlists', message);

    return h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    }).code(202); 
  } catch (error) {
    if (Boom.isBoom(error)) {
      return h.response({
        status: error.output.statusCode === 500 ? 'error' : 'fail',
        message: error.message,
      }).code(error.output.statusCode);
    }

    if (error.name === 'ValidationError') {
      return h.response({
        status: 'fail',
        message: error.message,
      }).code(400);
    }

    console.error(error);
    return h.response({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    }).code(500);
  }
};

module.exports = {
  postExportPlaylistsHandler,
};
