const Joi = require('joi');
const pool = require('../database/postgres');
const nanoid = require('nanoid');

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().required(),
});

const AlbumModel = {
  async findById(id) {
    const result = await pool.query('SELECT * FROM albums WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async save(albumData) {
    const { name, year } = albumData;
    const id = `album-${nanoid(16)}`;
    await pool.query(
      'INSERT INTO albums (id, name, year) VALUES ($1, $2, $3)',
      [id, name, year]
    );
    return id;
  },
};

module.exports = { AlbumPayloadSchema, AlbumModel };