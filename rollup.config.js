// rollup.config.js
export default {
  entry: "index.js",
  format: "cjs",
  external: [
    "dotenv",
    "koa",
    "koa-error",
    "koa-helmet",
    "koa-response-time",
    "koa-session",
    "koa-bodyparser",
    "koa-roarr",
    "kcors",
    "koa-qs",
    "is-lambda",
    "roarr",
    "serverless-http",
    "uuid/v4",
    "whatwg-url"
  ]
};
