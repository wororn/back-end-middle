// mengimpor dotenv dan menjalankan konfigurasinya
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const ClientError = require('./exceptions/ClientError');

// truncate
const truncates = require('./api/truncate');
const TruncateService = require('./services/postgres/TruncateService');

//song
const songs = require("./api/songs");
const SongsService = require("./services/postgres/SongsService")
const SongsValidator = require("./validator/songs");

// playlist
const playlists = require('./api/playlists');
const PlaylistService = require('./services/postgres/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists');

// users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

const init = async () => {
  const truncateService = new TruncateService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistService(collaborationsService);
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
});

// Error Handling
server.ext('onPreResponse', (request, h) => {
  const { response } = request;
  if (response instanceof ClientError) {
    const newResponse = h.response({
      status: 'fail',
      message: response.message,
    });
    newResponse.code(response.statusCode);
    return newResponse;
  }
  return response.continue || response;
});

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt
    },
  ]);

  // mendefinisikan strategy autentikasi jwt
    server.auth.strategy('playlistsapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),   
  });  

  //server register
  await server.register([
   
    {
      plugin: truncates,
      options: {
        service: truncateService
      },
    },
   
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator
      },
    },

    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator
      },
    },

    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator
      },
    },

    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator
      },
    },

    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        validator: CollaborationsValidator
      },
    },

  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
