'use strict';

function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
}

var koa = _interopDefault(require('koa'));
var responseTime = _interopDefault(require('koa-response-time'));
var session = _interopDefault(require('koa-session'));
var bodyParser = _interopDefault(require('koa-bodyparser'));
var helmet = _interopDefault(require('koa-helmet'));
var error = _interopDefault(require('koa-error'));
var log = _interopDefault(require('roarr'));
var qs = _interopDefault(require('koa-qs'));
var defaultLogMiddleware = _interopDefault(require('koa-roarr'));
var isLambda = _interopDefault(require('is-lambda'));
var defaultServerless = _interopDefault(require('serverless-http'));

var defaultErrorHandler = (err, ctx) => {
  const { message, statusCode, stack } = err;
  let func = statusCode >= 500 ? ctx.log.fatal : ctx.log.error;

  func({
    statusCode,
    message,
    stack
  }, statusCode >= 500 ? "server error" : "client error");
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
  let app = new koa();

  let {
    serverless = defaultServerless,
    port = process.env.PORT || 1234,
    logger = log.child({}),
    sessionKeys = [process.env.SESSION_KEY],
    sessionOpts = {
      key: "session",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    },
    sessionMiddleware = session(sessionOpts, app),
    bodyParserMiddleware = bodyParser(),
    errorMiddleware = error(),
    securityMiddleware = helmet(),
    loggerMiddleware = defaultLogMiddleware({ log }),
    timerMiddleware = responseTime(),
    errorHandler = defaultErrorHandler,
    beforeHook = () => {},
    afterHook = () => {}
  } = options;

  const { info, trace } = logger;

  trace({ isLambda }, "start");

  app.port = port;

  // Enable support for nested querystrings.
  qs(app);

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
  app.run = function (isLambdaOverride = false) {
    if (isLambdaOverride || isLambda) {
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

