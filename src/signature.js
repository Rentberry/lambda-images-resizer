module.exports = function(secret) {
  const crypto = require('crypto');

  return function(signature, width, height, key) {
    let hash = crypto.createHmac('sha256', secret);

    return signature === hash.update(width + 'x' + height + '/' + key).digest('hex')
  }
};
