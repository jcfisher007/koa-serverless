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

## Install

```sh
npm install koa-serverless esm
```

## Usage

Runs only with esm enabled.

### index.js

```js
// drop in replacement for `koa`.
var App = require("koa-serverless");
var app = new App();

// add your own middleware
var serve = require("koa-static");
app.use(serve("./public"));

// run program as daemon or export handler for lambda.
exports.handler = app.run(/* isLambdaOverride */);
```
