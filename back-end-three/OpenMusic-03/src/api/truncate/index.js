const TruncateHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'Truncate Table for OpenMusic API',
  version: '1.0.0',
  register: async (server, { service }) => {
    const songsHandler = new TruncateHandler(service);
    server.route(routes(songsHandler));
  },
};
