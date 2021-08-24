const routes = (handler) => [
    {
      method: 'POST',
      path: '/playlists',
      handler: handler.postPlaylistTabHandler,
      options: {
        auth: 'playlistsapp_jwt',
      },
    },
    {
      method: 'GET',
      path: '/playlists',
      handler: handler.getPlaylistsTabHandler,
      options: {
        auth: 'playlistsapp_jwt',
      },
    },
    {
      method: 'GET',
      path: '/playlists/{id}',
      handler: handler.getPlaylistTabByIdHandler,
      options: {
        auth: 'playlistsapp_jwt',
      },
    },
   /*  {
      method: 'PUT',
      path: '/playlists/{id}',
      handler: handler.putPlaylistTabByIdHandler,
      options: {
        auth: 'playlistsapp_jwt',
      },
    }, */
    {
      method: 'DELETE',
      path: '/playlists/{id}',
      handler: handler.deletePlaylistTabByIdHandler,
      options: {
        auth: 'playlistsapp_jwt',
      },
    },
    // playlist song
    {
      method: 'POST',
      path: '/playlists/{playlistId}/songs',
      handler: handler.postPlaylistMusicHandler,
      options: {
        auth: 'playlistsapp_jwt',
      },
    },
    {
      method: 'GET',
      path: '/playlists/{playlistId}/songs',
      handler: handler.getPlaylistMusicsHandler,
      options: {
        auth: 'playlistsapp_jwt',
      },
    },
    {
      method: 'DELETE',
      path: '/playlists/{playlistId}/songs',
      handler: handler.deletePlaylistMusicByIdHandler,
      options: {
        auth: 'playlistsapp_jwt',
      },
    },
  ];
  
  module.exports = routes;
  