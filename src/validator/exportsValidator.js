// src/validator/exportsValidator.js
const Joi = require('joi');

const ExportPlaylistPayloadSchema = Joi.object({
  targetEmail: Joi.string().email().required(),
});

const validateExportPlaylistPayload = (payload) => {
  const { error } = ExportPlaylistPayloadSchema.validate(payload);
  if (error) {
    const validationError = new Error(error.details.map(d => d.message).join(', '));
    validationError.name = 'ValidationError';
    throw validationError;
  }
};

module.exports = { validateExportPlaylistPayload };
