class PlaylistsHandler {
    constructor(service, validator) {
      this._service = service;
      this._validator = validator;
  
      this.postPlaylistTabHandler = this.postPlaylistTabHandler.bind(this);
      this.getPlaylistsTabHandler = this.getPlaylistsTabHandler.bind(this);
      this.getPlaylistTabByIdHandler = this.getPlaylistTabByIdHandler.bind(this);
      this.putPlaylistTabByIdHandler = this.putPlaylistTabByIdHandler.bind(this);
      this.deletePlaylistTabByIdHandler = this.deletePlaylistTabByIdHandler.bind(this);
  
      this.postPlaylistMusicHandler = this.postPlaylistMusicHandler.bind(this);
      this.getPlaylistMusicsHandler = this.getPlaylistMusicsHandler.bind(this);
      this.deletePlaylistMusicByIdHandler = this.deletePlaylistMusicByIdHandler.bind(this);
    }
  
    async postPlaylistTabHandler(request, h) {
      this._validator.validatePlaylistPayload(request.payload);
      const { name } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      const playlistId = await this._service.addPlaylist({
        name, owner: credentialId
      });
  
      const response = h.response({
        status: 'success',
        message: 'Playlist berhasil ditambahkan',
        data: {
          playlistId
        },
      });
      response.code(201);
      return response;
    }
  
    async getPlaylistsTabHandler(request) {
      const { id: credentialId } = request.auth.credentials;
      const playlists = await this._service.getPlaylists(credentialId);
      
      return {
        status: 'success',
        data: {
          playlists
        },
      };
    }
  
    async getPlaylistTabByIdHandler(request) {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistAccess(id, credentialId);
      const playlist = await this._service.getPlaylistById(id);

      return {
        status: 'success',
        data: {
          playlist
        },
      };
    }
  
    async putPlaylistTabByIdHandler(request) {
      this._validator.validatePlaylistPayload(request.payload);
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistAccess(id, credentialId);
      await this._service.editPlaylistById(id, request.payload);
  
      return {
        status: 'success',
        message: 'Playlist berhasil diperbarui'
      };
    }
  
    async deletePlaylistTabByIdHandler(request) {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistOwner(id, credentialId);
      await this._service.deletePlaylistById(id);
  
      return {
        status: 'success',
        message: 'Playlist berhasil dihapus'
      };
    }
  
     // ************************************************ playlistSong ************************************************//
  
    async postPlaylistMusicHandler(request, h) {
      this._validator.validatePlaylistMusicPayload(request.payload);
      const { songId } = request.payload;
      const { playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;
      
      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      await this._service.addPlaylistMusic(playlistId, songId);
  
      const response = h.response({
        status: 'success',
        message: 'Musik berhasil ditambahkan ke playlist'
      });
      response.code(201);
      return response;
    }
  
    async getPlaylistMusicsHandler(request) {
      const { playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      const songs = await this._service.getPlaylistMusics(playlistId);

      return {
        status: 'success',
        data: {
          songs
        },
      };
    }
  
    async deletePlaylistMusicByIdHandler(request) {
      const { playlistId } = request.params;
      const { songId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      await this._service.deletePlaylistMusicById(playlistId, songId);
  
      return {
        status: 'success',
        message: 'Musik berhasil dihapus dari playlist'
      };
    }
  }
  
  module.exports = PlaylistsHandler;
  