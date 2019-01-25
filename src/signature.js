module.exports = function(secret) {
  const crypto = require('crypto');
  const hash = crypto.createHmac('sha256', secret);

  return function(signature, width, height, key) {
    return signature === hash.update(width + 'x' + height + '/' + key).digest('hex')
  }
}
