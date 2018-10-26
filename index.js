"use strict";

import koa from "koa";
import responseTime from "koa-response-time";
import session from "koa-session";
import bodyParser from "koa-bodyparser";
import helmet from "koa-helmet";
import error from "koa-error";
import log from "roarr";
import qs from "koa-qs";
import defaultErrorHandler from "./error";
import defaultLogMiddleware from "koa-roarr";
import isLambda from "is-lambda";
import defaultServerless from "serverless-http";
import ServerApp from "./server";

function KoaServerlessApp({
  serverless = defaultServerless,
  port = process.env.PORT || 1234,
  logger = log.child({}),
  sessionKeys = [process.env.SESSION_KEY],
  sessionMiddleware,
  sessionOpts = {
    key: "session",
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  },
  bodyParserMiddleware = bodyParser(),
  errorMiddleware = error(),
  securityMiddleware = helmet(),
  loggerMiddleware = defaultLogMiddleware({ log }),
  timerMiddleware = responseTime(),
  errorHandler = defaultErrorHandler,
  beforeHook = () => {},
  afterHook = () => {}
} = {}) {
  let options = {
    logger,
    cookieName,
    cookieMaxAge,
    afterHook,
    beforeHook,
    loggerMiddleware,
    timerMiddleware,
    sessionMiddleware,
    bodyParserMiddleware,
    errorMiddleware,
    securityMiddleware,
    errorHandler
  };

  // Initialize your koa-application.
  let app = new koa();
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
  app.use(
    typeof sessionMiddleware !== "undefined"
      ? sessionMiddleware
      : session(sessionOpts, app)
  );

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
    trace(options, "run lambda");
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

export default KoaServerlessApp;
