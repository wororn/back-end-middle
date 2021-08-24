const routes = (handler) => [
  {
    method: 'POST',
    path: '/exports/playlists/{playlistId}',
    handler: handler.postExportPlaylistMusicHandler,
    options: {
      auth: 'playlistsapp_jwt',
    },
  },
];

module.exports = routes;
