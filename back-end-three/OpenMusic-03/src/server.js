// mengimpor dotenv dan menjalankan konfigurasinya
require('dotenv').config();
const path = require('path');

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const ClientError = require('./exceptions/ClientError');
const TooLargeError = require('./exceptions/TooLargeError');

// truncate
const truncates = require('./api/truncate');
const TruncateService = require('./services/postgres/TruncateService');

//song
const songs = require("./api/songs");
const SongsService = require("./services/postgres/SongsService")
const SongsValidator = require("./validator/songs");

// playlist
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
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

// exports
const _exports = require('./api/exports');

const producerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

// uploads
const uploads = require('./api/uploads');
const StorageService = require('./services/storage/StorageService');
const UploadsValidator = require('./validator/uploads');

// cache
const CacheService = require('./services/cache/CacheService');

const init = async () => {
  const cacheService = new CacheService();
  const truncateService = new TruncateService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService(cacheService);
  const songsService = new SongsService(cacheService);
  const playlistsService = new PlaylistsService(collaborationsService,cacheService);
  const storageService = new StorageService(path.resolve(__dirname,'api/uploads/file/pictures'));
  
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt
    },
    {
      plugin: Inert,
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

  // Error Handling
    server.ext('onPreResponse', (request, h) => {
      const { response } = request;
        if (response instanceof ClientError  || response instanceof TooLargeError) {
          const newResponse = h.response({
          status: 'fail',
            message: response.message,
          });
      newResponse.code(response.statusCode);
      return newResponse;
    }
      return response.continue || response;
    });
 
  //server register
  await server.register([

    {
      plugin: truncates,
      options: {
        service: truncateService,
      },
    },
   
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },

    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },

    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },

    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },

    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,
      },
    },

    {
      plugin: _exports,
      options: {
        producerService,
        playlistsService,
        validator: ExportsValidator,
      },
    },

    {
      plugin: uploads,
      options: {
        service: storageService,
        validator: UploadsValidator,
      },
    },

  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
