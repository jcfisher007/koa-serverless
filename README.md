# koa-serverless-ready

A koajs distribution that focuses on:

- serverless deployment (AWS)
- local server dev tools
- default ct.session middleware
- default ctx.log middleware
- default security header middleware (koa-helmet)
- default cors middleware
- default bodyParser middlware

## Usage

```js
var App = require("koa-serverless-ready");
var app = App({ middlewares: [serve("/public")] });
// run program as daemon or export handler for lambda.
exports.handler = app.run();
```
