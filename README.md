# koa-serverless

A koajs distribution that focuses on:

- serverless deployment (AWS Gateway + Lambda)
- standard nodejs deployment
- default nested querystring support
- default session middleware (koa-session)
- default log middleware
- default security header middleware (koa-helmet)
- default cors middleware (kcors)
- default body parser middlware (koa-bodyparser)

## Usage

Runs only with esm enabled.

```js
// Run with node -r esm

// drop in replacement for `koa`.
import App from "koa-serverless";

// import your koa middleware.
import serve from "koa-static";

// create your application.
var app = new App();

// add your own middleware
app.use(serve("./public"));

// run program as daemon or export handler for lambda.
export const handler = app.run();
```
