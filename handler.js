let AWS = require('aws-sdk');
let Sharp = require('sharp');

module.exports = function(options) {
  let S3 = new AWS.S3({region: options.region});

  function download(bucket, key) {
    return S3.getObject({Bucket: bucket, Key: key}).promise();
  }

  function transform(data, width, height) {
    return Sharp(data.Body)
      .resize(width, height)
      .toBuffer()
  }

  function upload(bucket, key, buffer) {
    return S3.putObject({
      Body: buffer,
      Bucket: bucket,
      Key: key,
      ACL:'public-read',
      CacheControl: 'public, max-age=31536000'
    }).promise()
  }

  return function(event) {
    return new Promise(function (fulfill, reject){
      let buffer;
      let key = event.path;
      let splitted_key = key ? key.split(options.cachePrefix) : [];
      key = splitted_key[1];

      let match = key.match(/(\d+|auto)x(\d+|auto)\/(.*)/);

      if(!match) {
        reject(new Error('no match found'));
      }

      let width = match[1];
      let height = match[2];

      // Here we try to convert width and height in integers. If we fail with one conversion, we set the value to 'null' (eg: 620xauto resolves in 620 and null)
      let width_number = parseInt(width, 10);
      let height_number = parseInt(height, 10);
      if(isNaN(width_number) && isNaN(height_number)) {
        reject(new Error('Invalid dimensions'));
      }
      if(isNaN(width_number)) width_number = null;
      if(isNaN(height_number)) height_number = null;

      return download(options.bucket, key)
        .then((data) => { return transform(data, width_number, height_number); })
        .then((data) => { buffer = data; return upload(options.bucket, key, buffer); })
        .then(() => {
          fulfill({
            statusCode: 200,
            body: buffer.toString()
          })
        })
        .catch(err => reject(err))
    })
  }
}

