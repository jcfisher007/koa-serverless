# koa-serverless-ready

A koajs distribution that focuses on:

- serverless deployment (AWS)
- standard nodejs deployment
- default ctx.session middleware (koa-session)
- default ctx.log middleware
- default security header middleware (koa-helmet)
- default cors middleware (kcors)
- default ctx.body middlware (koa-bodyparser)

## Usage

```js
import App from "koa-serverless-ready";
import serve from "koa-static";

var app = App({ middlewares: [serve("./public")] });
// run program as daemon or export handler for lambda.
exports.handler = app.run();
```
