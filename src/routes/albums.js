const {
  postAlbumHandler,
  getAlbumsHandler,
  getAlbumByIdHandler,
  putAlbumByIdHandler,
  deleteAlbumByIdHandler,
  uploadCoverHandler,
  likeAlbumHandler,
  unlikeAlbumHandler,
  getAlbumLikeCountHandler,
} = require('../handlers/albums');

const routes = [
  {
    method: 'POST',
    path: '/albums',
    handler: postAlbumHandler,
  },
  {
    method: 'GET',
    path: '/albums',
    handler: getAlbumsHandler,
  },
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: getAlbumByIdHandler,
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: putAlbumByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: deleteAlbumByIdHandler,
  },
  {
    method: 'POST',
    path: '/albums/{id}/covers',
    handler: uploadCoverHandler,
    options: {
      payload: {
        multipart: true,
        output: 'stream',
        parse: true,
        allow: 'multipart/form-data'
      }
    }
  },
  {
    method: 'POST',
    path: '/albums/{id}/likes',
    handler: likeAlbumHandler,
    options: {
      payload: {
        multipart: true,
        output: 'stream',
        parse: true,
        allow: 'multipart/form-data'
      }
    }
  },
  {
    method: 'DELETE',
    path: '/albums/{id}/likes',
    handler: unlikeAlbumHandler,
  },
  {
    method: 'GET',
    path: '/albums/{id}/likes',
    handler: getAlbumLikeCountHandler,
  }
];

module.exports = routes;