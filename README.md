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
let handler = require('lambda-images-resizer')({
  region: process.env.REGION,
  bucket: process.env.BUCKET,
  cachePrefix: process.env.CACHE_PREFIX
})

exports.handler = function(event, context) {
    handler(event)
        .then((response) => {
            context.succeed(response)
        })
        .catch((err) => context.fail(err))
}
```

## To-do list:
- [ ] Resizing constraints
- [ ] Signatures checking
