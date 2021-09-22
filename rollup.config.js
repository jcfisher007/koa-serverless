// rollup.config.js
export default {
  input: "index.js",
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    exports: "auto"
  },
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
