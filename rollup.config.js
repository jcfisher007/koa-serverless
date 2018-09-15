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
    "kcors",
    "is-lambda",
    "roarr",
    "koa-qs",
    "uuid/v4",
    "whatwg-url",
    "aws-serverless-express"
  ]
};
