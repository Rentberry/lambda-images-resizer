Images resizing with AWS Lambda
---
[![npm](https://img.shields.io/npm/v/lambda-images-resizer.svg)]()
[![npm](https://img.shields.io/npm/l/lambda-images-resizer.svg)]()
[![David](https://img.shields.io/david/rentberry/lambda-images-resizer.svg)]()

## Install
```
yarn add lambda-images-resizer
```

## Example of  index.js file of lambda function
```js
const HttpError = require('lambda-images-resizer/httpError')
const handle = require('lambda-images-resizer/handler')({
  region: process.env.REGION,
  bucket: process.env.BUCKET,
  cachePrefix: process.env.CACHE_PREFIX,
  signatureVerification: process.env.SIGNATURE_VERIFICATION === '1',
  signatureSecret: process.env.SIGNATURE_SECRET,
  cdnUrl: process.env.CDN_URL,
  maxWidth: parseInt(process.env.MAX_WIDTH, 10) || 1920,
  maxHeight: parseInt(process.env.MAX_HEIGHT, 10) || 1080,
  logging: process.env.LOGGING === '1'
})

const handler = function(event, context) {
  handle(event)
    .then((response) => {
      context.succeed(response)
    })
    .catch((err) => {
      if (err instanceof HttpError) {
        return context.succeed({
          statusCode: err.statusCode,
          body: err.message
        })
      }
      return context.fail(err)
    })
}

exports.handler = handler

```

## To-do list:
- [x] Resizing constraints
- [x] Signatures checking
