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
// drop in replacement for `koa`.
import App from "koa-serverless-ready";

// import your koa middleware.
import serve from "koa-static";

// create your application.
var app = new App();

// add your own middleware
app.use(serve("./public"));

// run program as daemon or export handler for lambda.
exports.handler = app.run();
```
