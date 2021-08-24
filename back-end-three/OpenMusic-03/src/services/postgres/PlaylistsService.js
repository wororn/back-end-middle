const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const { mapDBToModel, mapDBToPlaylist } = require('../../utils');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationService, cacheService) {
      this._pool = new Pool();
      this._collaborationService = collaborationService;
      this._cacheService = cacheService;
  }

  async addPlaylist({
    name, 
    owner
  }) 
    {

        const id = `playlist-${nanoid(16)}`;

        const query = {
          text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
          values: [id, name, owner],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
          throw new InvariantError('Playlist gagal ditambahkan');
        }

        await this._cacheService.delete(`playlist:${id}`);

        return result.rows[0].id;
      
  };

  async getPlaylists(owner) {
    const resultCache = await this._cacheService.get(`owner:${owner}`);
    if (resultCache) {
      return JSON.parse(resultCache);
    }
    const query = {
      text: 
            `SELECT music.id, music.name, users.username 
              FROM 
                  (SELECT playlists.* FROM playlists
                  LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
                  WHERE playlists.owner = $1 OR collaborations.user_id = $1
                  GROUP BY playlists.id) music
              LEFT JOIN users ON users.id = music.owner`,
      values: [owner]
    };

    const result = await this._pool.query(query);
    const mappedResult = result.rows.map(mapDBToPlaylist);
    await this._cacheService.set(`owner:${owner}`, JSON.stringify(mappedResult));
    return mappedResult;   
  }

  async deletePlaylistById(id) {
      const query = {
        text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
        values: [id]
      };

      const result = await this._pool.query(query);
      if (!result.rows.length) {
        throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
      }

        this._cacheService.delete(`playlists:${id}`);
  } 

  async verifyPlaylistOwner(id, owner) {
      const query = {
        text: 'SELECT * FROM playlists WHERE id = $1',
        values: [id]
      };
      const result = await this._pool.query(query);
      if (!result.rows.length) {
        throw new NotFoundError('Playlist tidak ditemukan');
      }
      const playlist = result.rows[0];
      if (playlist.owner !== owner) {
        throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
      }
  }

  async verifyPlaylistAccess(id, userId) {
      try {
        await this.verifyPlaylistOwner(id, userId);
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw error;
        }
        try {
          await this._collaborationService.verifyCollaborator(id, userId);
        } catch {
          throw error;
        }
      }
  }

  async verifyPlaylistIsExist(playlistId) {
    const query = {
      text: 'SELECT COUNT(1) FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result) {
      throw new NotFoundError('Playlist yang dicari tidak ditemukan');
    }
  }

  // ************************************************ playlistSong ************************************************//
 
  async addPlaylistMusic(playlistId, songId) {
      await this.verifyPlaylistIsExist(playlistId);
      const id = `playlistsong-${nanoid(16)}`;
      const query = {
        text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
        values: [id, playlistId, songId],
      };
      const result = await this._pool.query(query);
      if (!result.rows.length) {
        throw new InvariantError('Lagu gagal ditambahkan ke playlist');
      }
      
      await this._cacheService.delete(`playlist_songs:${playlistId}`);
      return result.rows[0].id;
  }

  async getPlaylistMusics(playlistId) {
    const resultCache = await this._cacheService.get(`playlist_songs:${playlistId}`);
    if (resultCache) {
      return JSON.parse(resultCache);    
    }
  
      const query = {
        text: 
              `SELECT songs.id, songs.title, songs.performer FROM songs
              LEFT JOIN playlistsongs ON playlistsongs.song_id = songs.id
              WHERE playlistsongs.playlist_id = $1
              GROUP BY songs.id`,
        values: [playlistId]
      };
      const result = await this._pool.query(query);
      const mappedResult = result.rows.map(mapDBToModel);
      await this._cacheService.set(`playlist_songs:${playlistId}`,JSON.stringify(mappedResult));
      return mappedResult;
  }

  async deletePlaylistMusicById(playlistId, songId) {
    await this.verifyPlaylistIsExist(playlistId);
    
      const query = {
        text: `DELETE FROM playlistsongs 
              WHERE playlist_id = $1 AND song_id = $2 RETURNING id`,
        values: [playlistId, songId]
      };

      const result = await this._pool.query(query);
      if (!result.rows.length) {
        throw new InvariantError('Lagu gagal dihapus dari playlist. Id lagu tidak ditemukan');
      }
      await this._cacheService.delete(`playlist_songs:${playlistId}`);
  }

}

module.exports = PlaylistsService;
