const InvariantError = require('../../exceptions/InvariantError');
const { SongNamePayloadSchema, SongIdPayloadSchema } = require('./schema');

const PlaylistsValidator = {
  validatePlaylistPayload: (payload) => {
    const validationResult = SongNamePayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validatePlaylistMusicPayload: (payload) => {
    const validationResult = SongIdPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};
module.exports = PlaylistsValidator;
