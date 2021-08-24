const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async getPlaylistByName(playlistId) {
    const resultCache = await this._cacheService.get(`playlistName-consumer:${playlistId}`);
    if (resultCache) {
      return JSON.parse(resultCache);
    }
    const query = {
      text: 
             `SELECT name FROM playlists 
             INNER JOIN playlistsongs ON playlistsongs.playlist_id = playlists.id
             INNER JOIN songs ON songs.id = playlistsongs.song_id 
             WHERE playlists.id = $1
             GROUP BY playlists.id `,
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    if (!result.rows) {
      throw new InvariantError('Gagal mengambil nama playlist');
    }

    await this._cacheService.set(`playlistName-consumer:${playlistId}`, JSON.stringify(result));
    return result.rows[0].name;
  }
}

module.exports = PlaylistService;
