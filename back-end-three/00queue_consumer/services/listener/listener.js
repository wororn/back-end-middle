class Listener {
  constructor(playlistService, playlistSongsService, mailSender) {
    this._playlistService = playlistService;
    this._playlistSongsService = playlistSongsService;
    this._mailSender = mailSender;

    this.listen = this.listen.bind(this);
  
  }

  async listen(message) {
    try {
      const { playlistId, targetEmail } = JSON.parse(message.content.toString());
      const playlistName = await this._playlistService.getPlaylistByName(playlistId);
      const songs = await this._playlistSongsService.getSongsByPlaylistId(playlistId);
      const result = await this._mailSender.sendEmail(
        targetEmail,
        playlistName,
        JSON.stringify(songs),
      );
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Listener;
