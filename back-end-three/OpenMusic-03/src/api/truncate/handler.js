
class TruncateHandler {
  constructor(service) {
    this._service = service;
    this.truncateAllTablesHandler= this.truncateAllTablesHandler.bind(this);
  }

  async truncateAllTablesHandler(request) {
    const apiKey = request.headers['x-api-key'];
    await this._service.truncateTables(apiKey);

    return {
      status: 'success',
      message: 'Tabel berhasil dihapus',
    };
  }

}

module.exports = TruncateHandler;
