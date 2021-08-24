const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async getSongsByPlaylistId(playlistId) {
    const resultCache = await this._cacheService.get(`playlistSongs-consumer:${playlistId}`);
    if (resultCache) {
      return JSON.parse(resultCache);
    }

    const query = {
      text:       
          `SELECT music.id, music.title, music.performer
           from (
                  SELECT songs.id as id, songs.title as title, songs.performer as performer,
                  playlistsongs.playlist_id as playlistID 
                  from songs
                  INNER JOIN playlistsongs ON songs.id = playlistsongs.song_id 
                  where playlistsongs.playlist_id = $1
                  GROUP BY playlistsongs.playlist_id,songs.id,songs.title,songs.performer
           )music
           INNER JOIN playlists ON music.playlistID = playlists.id
           WHERE playlists.id = $1
           GROUP BY playlists.id, music.id,music.title,music.performer
           order by music.title asc `,            
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rows) {
      throw new InvariantError('Gagal mengambil lagu-lagu dari playlist');
    }

    await this._cacheService.set(`playlistSongs-consumer:${playlistId}`, JSON.stringify(result));
    return result.rows;
  }
}

module.exports = PlaylistSongsService;
