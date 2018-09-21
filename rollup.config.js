// rollup.config.js
export default {
  entry: "index.js",
  format: "cjs",
  external: [
    "koa",
    "koa-error",
    "koa-helmet",
    "koa-response-time",
    "koa-session",
    "koa-bodyparser",
    "koa-roarr",
    "koa-qs",
    "is-lambda",
    "roarr",
    "serverless-http",
    "uuid/v4"
  ]
};
