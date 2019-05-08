const AWS = require('aws-sdk');
const Sharp = require('sharp');
const HttpError = require('./httpError');
const SignatureVerify = require('./signature');
const mime = require('mime/lite');
const supportedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/tiff",
  "image/svg+xml"
];

module.exports = function(options) {
  const S3 = new AWS.S3({region: options.region});
  const signVerify = new SignatureVerify(options.signatureSecret);

  function download(bucket, key) {
    return new Promise(function (fulfill, reject) {
      S3.getObject({Bucket: bucket, Key: key}, function(err, data) {
        if (err) return reject(new HttpError('Not found', 404));
        fulfill(data)
      })
    })
  }

  function transform(data, width, height, format) {
    if (format === 'gif') {
      format = 'jpeg';
    }

    return new Promise(function (fulfill, reject) {
      Sharp(data.Body)
          .resize(width, height, {
            withoutEnlargement: true
          })
          .toFormat(format)
          .toBuffer(function(err, outputBuffer) {
            if (err) reject(err)
            fulfill(outputBuffer)
          })
    })
  }

  function upload(bucket, key, buffer, mimeType) {
    return S3.putObject({
      Body: buffer,
      Bucket: bucket,
      Key: key,
      ACL:'public-read',
      CacheControl: 'public, max-age=31536000',
      ContentType: mimeType
    }).promise()
  }

  return function(event) {
    return new Promise(function (fulfill, reject) {
      if (options.logging) {
        console.log(event.path)
      }
      let signature = event.queryStringParameters ? event.queryStringParameters.s : null;
      let key = event.path;
      let splitted_key = key ? key.split(options.cachePrefix) : [];
      let destKey = event.path.replace(/^\/(.*)/, '$1');
      key = splitted_key[1];

      if (!key) {
        return reject(new HttpError('Unsupported image location', 421))
      }

      let match = key.match(/(\d+|auto)x(\d+|auto)\/(.*)/);

      if(!match) {
        return reject(new HttpError('Malformed route', 406));
      }

      let width = parseInt(match[1], 10);
      let height = parseInt(match[2], 10);
      let originalKey = match[3];

      if (options.signatureVerification && (!signature || !signVerify(signature, match[1], match[2], match[3]))) {
        return reject(new HttpError('Invalid signature', 403));
      }

      if(isNaN(width) && isNaN(height)) {
        reject(new HttpError('Invalid dimensions', 400));
      }

      if(isNaN(width)) width = null;
      if(isNaN(height)) height = null;

      if (width > options.maxWidth || height > options.maxHeight) {
        return reject(new HttpError('Dimensions maximum constraint violation', 403));
      }

      let mimeType = mime.getType(originalKey)

      if (supportedTypes.indexOf(mimeType) === -1) {
        return reject(new HttpError('Unsupported format', 415));
      }

      return download(options.bucket, originalKey)
          .then((data) => { return transform(data, width, height, mime.getExtension(mimeType)); })
          .then((buffer) => {
            fulfill({
              isBase64Encoded: true,
              statusCode: 200,
              body: buffer.toString('base64'),
              headers: {
                'Content-Type': mimeType
              }
            });

            return buffer;
          })
          .then((buffer) => { return upload(options.bucket, destKey, buffer, mimeType); })
          .catch(err => reject(err))
    })
  }
}
