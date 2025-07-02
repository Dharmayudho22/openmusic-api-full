const { AlbumPayloadSchema } = require('../models/album-model');
const NotFoundError = require('../NotFoundError');
const Path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../auth/authMiddleware');
const { likeAlbum, unlikeAlbum } = require('../services/albums');
const fs = require('fs');
const { AlbumModel } = require('../models/album-model');
const pool = require('../database/postgres');
const {
  getAllAlbums,
  getAlbumById,
  addAlbum,
  editAlbumById,
  deleteAlbumById,
  getAlbumWithSongs,
  getAlbumLikeCount,
} = require('../services/albums');

const postAlbumHandler = async (request, h) => {
  const validation = AlbumPayloadSchema.validate(request.payload);
  if (validation.error) {
    return h.response({
      status: 'fail',
      message: validation.error.message,
    }).code(400);
  }

  const id = await addAlbum(request.payload);
  return h.response({
    status: 'success',
    data: { albumId: id },
  }).code(201);
};

const getAlbumsHandler = async (_request, h) => {
  const albums = await getAllAlbums();
  return h.response({
    status: 'success',
    data: { albums },
  });
};

const getAlbumByIdHandler = async (request, h) => {
  try {
    const { id } = request.params;
    const album = await getAlbumWithSongs(id); 
    if (!album) {
      return h.response({
        status: 'fail',
        message: 'Album tidak ditemukan',
      }).code(404);
    }
    return h.response({
      status: 'success',
      data: { album },
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return h.response({
        status: 'fail',
        message: error.message,
      }).code(404);
    }
    console.error(error);
    return h.response({
      status: 'error',
      message: 'Maaf, terjadi kegagalan pada server kami.',
    }).code(500);
  }
};

const putAlbumByIdHandler = async (request, h) => {
  const validation = AlbumPayloadSchema.validate(request.payload);
  if (validation.error) {
    return h.response({
      status: 'fail',
      message: validation.error.message,
    }).code(400);
  }

  const updated = await editAlbumById(request.params.id, request.payload);
  if (!updated) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui album. Id tidak ditemukan',
    }).code(404);
  }

  return h.response({
    status: 'success',
    message: 'Album berhasil diperbarui',
  });
};

const deleteAlbumByIdHandler = async (request, h) => {
  const deleted = await deleteAlbumById(request.params.id);
  if (!deleted) {
    return h.response({
      status: 'fail',
      message: 'Gagal menghapus album. Id tidak ditemukan',
    }).code(404);
  }

  return h.response({
    status: 'success',
    message: 'Album berhasil dihapus',
  });
};

async function uploadAlbumCover(id, coverUrl) {
  const album = await AlbumModel.findById(id);
  if (!album) throw new Error('Album tidak ditemukan');

  // Update cover_url di database
  const result = await pool.query(
    'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING *',
    [coverUrl, id]
  );

  return result.rows[0];
}

const uploadCoverHandler = async (request, h) => {
  try {
    const { id } = request.params;

    const { cover } = request.payload;

    if (!cover || !cover.hapi || !cover.hapi.filename) {
      return h.response({
        status: 'fail',
        message: 'File cover wajib diisi',
      }).code(400);
    }

    const allowedMime = ['image/jpeg', 'image/png'];
    const mimeType = cover.hapi.headers['content-type'];

    if (!allowedMime.includes(mimeType)) {
      return h.response({
        status: 'fail',
        message: 'Format file tidak didukung. Gunakan JPEG/PNG',
      }).code(400);
    }

    const extension = Path.extname(cover.hapi.filename);
    const fileName = `${uuidv4()}${extension}`;
    const uploadPath = Path.join(__dirname, '..', 'uploads', fileName);

    await new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(uploadPath);
      stream.on('finish', resolve);
      stream.on('error', reject);
      cover.pipe(stream);
    });

    const coverUrl = `/uploads/${fileName}`;
    const updatedAlbum = await uploadAlbumCover(id, coverUrl);

    return h.response({
      status: 'success',
      message: 'Cover album berhasil diunggah',
      data: { album: updatedAlbum },
    }).code(201);
  } catch (error) {
    console.error(error);
    return h.response({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    }).code(500);
  }
};

const likeAlbumHandler = async (request, h) => {
  try {
    const userId = authenticate(request);
    const { id } = request.params;

    const likedAlbum = await likeAlbum(userId, id);

    return h.response({
      status: 'success',
      message: 'Anda berhasil menyukai album',
      data: { album: likedAlbum },
    }).code(201);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return h.response({
        status: 'fail',
        message: error.message,
      }).code(404);
    }

    console.error(error);
    return h.response({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    }).code(500);
  }
};

const unlikeAlbumHandler = async (request, h) => {
  try {
    const userId = authenticate(request);
    const { id } = request.params;

    const unlikedAlbum = await unlikeAlbum(userId, id);

    return h.response({
      status: 'success',
      message: 'Anda berhasil mencabut suka dari album',
      data: { album: unlikedAlbum },
    }).code(200);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return h.response({
        status: 'fail',
        message: error.message,
      }).code(404);
    }

    console.error(error);
    return h.response({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    }).code(500);
  }
};

const getAlbumLikeCountHandler = async (request, h) => {
  try {
    const { id } = request.params;

    const likeCount = await getAlbumLikeCount(id);

    return h.response({
      status: 'success',
      data: {
        likes: likeCount,
      },
    }).code(200);
  } catch (error) {
    console.error(error);
    return h.response({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    }).code(500);
  }
};

module.exports = {
  postAlbumHandler,
  getAlbumsHandler,
  getAlbumByIdHandler,
  putAlbumByIdHandler,
  deleteAlbumByIdHandler,
  uploadCoverHandler,   
  likeAlbumHandler,     
  unlikeAlbumHandler,
  getAlbumById,         
  uploadAlbumCover, 
  getAlbumLikeCountHandler,
};