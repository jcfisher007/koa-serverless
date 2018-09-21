# koa-serverless

A koajs bundle including:

- Serverless Support ([serverless-http](https://github.com/dougmoscrop/serverless-http))
- load .env file ([dotenv](https://github.com/motdotla/dotenv))
- nested querystring support ([qs](https://github.com/ljharb/qs))
- session management ([koa-session](https://github.com/koajs/session))
- logging ([koa-roarr](https://github.com/jcfisher007/koa-roarr))
- security headers ([koa-helmet](https://github.com/venables/koa-helmet))
- body parser ([koa-bodyparser](https://github.com/koajs/bodyparser))

Make koajs applications with minimal boilerplate.

## Install

```sh
npm install koa-serverless
```

## Example

```js
// drop in replacement for `koa`.
var App = require("koa-serverless");
var app = new App();This will give you the basic mechanisms to

// add your own middleware
var serve = require("koa-static");
app.use(serve("./public"));

// run program as daemon or export handler for lambda.
exports.handler = app.run(/* isLambdaOverride */);
```
