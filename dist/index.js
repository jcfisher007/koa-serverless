'use strict';

var koa = require('koa');
var responseTime = require('koa-response-time');
var session = require('koa-session');
var bodyParser = require('koa-bodyparser');
var helmet = require('koa-helmet');
var error = require('koa-error');
var log = require('roarr');
var qs = require('koa-qs');
var defaultLogMiddleware = require('koa-roarr');
var isLambda = require('is-lambda');
var defaultServerless = require('serverless-http');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var koa__default = /*#__PURE__*/_interopDefaultLegacy(koa);
var responseTime__default = /*#__PURE__*/_interopDefaultLegacy(responseTime);
var session__default = /*#__PURE__*/_interopDefaultLegacy(session);
var bodyParser__default = /*#__PURE__*/_interopDefaultLegacy(bodyParser);
var helmet__default = /*#__PURE__*/_interopDefaultLegacy(helmet);
var error__default = /*#__PURE__*/_interopDefaultLegacy(error);
var log__default = /*#__PURE__*/_interopDefaultLegacy(log);
var qs__default = /*#__PURE__*/_interopDefaultLegacy(qs);
var defaultLogMiddleware__default = /*#__PURE__*/_interopDefaultLegacy(defaultLogMiddleware);
var isLambda__default = /*#__PURE__*/_interopDefaultLegacy(isLambda);
var defaultServerless__default = /*#__PURE__*/_interopDefaultLegacy(defaultServerless);

var defaultErrorHandler = (err, ctx) => {
  const { message, statusCode, stack } = err;
  let func = statusCode >= 500 ? ctx.log.fatal : ctx.log.error;

  func(
    {
      statusCode,
      message,
      stack
    },
    statusCode >= 500 ? "server error" : "client error"
  );
};

function ServerApp(options, listenCallback) {
  const { app, port, logger } = options;

  function defaultListenCallback(err, result) {
    if (err) {
      logger.fatal("ERROR: " + err);
    }

    logger.info({ port, NODE_ENV: process.env.NODE_ENV }, "Listening on port");
  }

  app.listen(port, listenCallback || defaultListenCallback);
}

function KoaServerlessApp(options = {}) {
  // Initialize your koa-application.
  let app = new koa__default['default']();

  let {
    serverless = defaultServerless__default['default'],
    port = process.env.PORT || 1234,
    logger = log__default['default'].child({}),
    sessionKeys = [process.env.SESSION_KEY],
    sessionOpts = {
      key: "session",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    },
    sessionMiddleware = session__default['default'](sessionOpts, app),
    bodyParserMiddleware = bodyParser__default['default'](),
    errorMiddleware = error__default['default'](),
    securityMiddleware = helmet__default['default'](),
    loggerMiddleware = defaultLogMiddleware__default['default']({ log: log__default['default'] }),
    timerMiddleware = responseTime__default['default'](),
    errorHandler = defaultErrorHandler,
    beforeHook = () => {},
    afterHook = () => {}
  } = options;

  const { info, trace } = logger;

  trace({ isLambda: isLambda__default['default'] }, "start");

  app.port = port;

  // Enable support for nested querystrings.
  qs__default['default'](app);

  trace("beforeHook");
  beforeHook(app);

  // Add sensible error handling.
  app.on("error", errorHandler);

  trace("register loggerMiddleware");

  // logger
  app.use(loggerMiddleware);

  trace("register timerMiddleware");

  // Run timer middleware (koa-response-time).
  app.use(timerMiddleware);

  trace("register errorMiddleware");

  // Enhance error handling (koa-error).
  app.use(errorMiddleware);

  trace("register securityMiddleware");

  // register secure headers (koa-helmet).
  app.use(securityMiddleware);

  trace("register sessionMiddleware");

  // initialize session state.
  app.keys = sessionKeys;
  app.use(sessionMiddleware);

  trace("register bodyParserMiddleware");

  // default ctx.request.body (koa-bodyparser)
  app.use(bodyParserMiddleware);

  app.handler = () => {
    trace("start lambda");
    return serverless(app);
  };

  app.serve = cb => {
    trace(options, "start server");
    return ServerApp({ app, port, logger });
  };

  // the run function selects between serve and handler.
  app.run = function(isLambdaOverride = false) {
    if (isLambdaOverride || isLambda__default['default']) {
      return app.handler();
    } else {
      return app.serve();
    }
  };

  trace("afterHook");
  afterHook(app);

  return app;
}

module.exports = KoaServerlessApp;
