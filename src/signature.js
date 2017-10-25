module.exports = function(secret) {
  const crypto = require('crypto');

  return function(signature, width, height, key) {
    return signature === crypto.createHmac('sha256', secret).update(width + 'x' + height + '/' + key).digest('hex')
  }
}
