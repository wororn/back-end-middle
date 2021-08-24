const Joi = require('joi');

const SongNamePayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const SongIdPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = { SongNamePayloadSchema, SongIdPayloadSchema };
