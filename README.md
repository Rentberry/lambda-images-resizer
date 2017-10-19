Images resizing with AWS Lambda
---
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
