/* eslint-disable class-methods-use-this */
const ClientError = require('../../exceptions/ClientError');

class ErrorHandler {
  errorHandler(request, h) {
    // mendapatkan konteks response dari request
    const { response } = request;
    if (response instanceof ClientError) {
      // kondisi ini digunakan untuk menangkap error yang sengaja di-throw    
      const newResponse = h.response({
        status: 'fail',
          message: response.message,
        });
    newResponse.code(response.statusCode);
    return newResponse;
    } 
   //server error
    const response = h.response({
      status: 'error',
      message: 'Maaf, terjadi kegagalan pada server kami.',
    });
    response.code(500);
    console.error(error);

    // jika bukan ClientError, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return response.continue || response;
  }
}

module.exports = ErrorHandler;
