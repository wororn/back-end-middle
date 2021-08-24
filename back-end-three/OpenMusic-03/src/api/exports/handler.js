const ClientError = require("../../exceptions/ClientError");

class ExportsHandler {
  constructor(producerService, playlistsService, validator) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
    this._validator = validator;
    this.postExportPlaylistMusicHandler = this.postExportPlaylistMusicHandler.bind(this); 
  }

  async postExportPlaylistMusicHandler(request, h) {

  try {
          this._validator.validateExportPlaylistPayload(request.payload);
          const { playlistId } = request.params;
          const { id:credentialId } = request.auth.credentials;

          await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
         
          const message = {
            credentialId,
            playlistId,
            targetEmail: request.payload.targetEmail,
          };

          await this._producerService.sendMessage(process.env.PLAYLIST_CHANNEL_NAME,
            JSON.stringify(message));

          const response = h.response({
            status: 'success',
            message: 'Permintaan Anda sedang diproses',
          });
        response.code(201);
        return response;

  } catch (error) {

        if (error instanceof ClientError) {
            const response = h.response({
                status: 'fail',
                message: error.message,
            });
            response.code(error.statusCode);
            return response;
        }

        // Server ERROR!
        const response = h.response({
            status: 'error',
            message: 'Maaf, terjadi kegagalan pada server kami.',
        });
        response.code(500);
        console.error(error);
        return response;

    }
  }
}

module.exports = ExportsHandler;
