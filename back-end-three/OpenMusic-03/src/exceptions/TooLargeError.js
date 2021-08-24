const ClientError = require('./ClientError');
class TooLargeError extends ClientError {
  constructor(message) {
    super(message);
    this.statusCode = 413;
    this.name = 'TooLargeError';
  }
}
module.exports = TooLargeError;