"use strict";

import koa from "koa";
import responseTime from "koa-response-time";
import session from "koa-session";
import bodyParser from "koa-bodyparser";
import cors from "kcors";
import helmet from "koa-helmet";
import error from "koa-error";
import log from "roarr";
import qs from "koa-qs";
import defaultErrorHandler from "./error";
import defaultLogMiddleware from "./logger";
import isLambda from "is-lambda";
import lambdaWorkaroundMiddleware from "./lambdaWorkaround";
import LambdaHandler from "./lambda";
import ServerApp from "./server";

function KoaServerlessApp({
  port = process.env.PORT || 1234,
  logger = log.child({ isLambda }),
  sessionKeys = [process.env.SESSION_KEY],
  cookieName = "session",
  cookieMaxAge = 30 * 24 * 60 * 60 * 1000, // 30 days
  sessionMiddleware,
  bodyParserMiddleware = bodyParser(),
  errorMiddleware = error(),
  securityMiddleware = helmet(),
  corsMiddleware = cors({
    origin: process.env.CORS_ORIGIN
  }),
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
    errorHandler,
    corsMiddleware
  };

  // Initialize your koa-application.
  let app = new koa();
  const { info, trace } = logger;

  // Enable support for nested querystrings.
  qs(app);

  trace("beforeHook");
  beforeHook(app);

  // Add sensible error handling.
  app.on("error", errorHandler);

  trace("install customer beforeMiddlewares");

  trace("register default middleware");

  // handle requests from lambda
  if (isLambda) {
    app.use(lambdaWorkaroundMiddleware);
  }

  // logger
  app.use(loggerMiddleware);

  // Run timer middleware (koa-response-time).
  app.use(timerMiddleware);

  // Enhance error handling (koa-error).
  app.use(errorMiddleware);

  // register secure headers (koa-helmet).
  app.use(securityMiddleware);

  // initialize session state.
  app.keys = sessionKeys;
  app.use(
    typeof sessionMiddleware !== "undefined"
      ? sessionMiddleware
      : session(
          {
            key: cookieName,
            maxAge: cookieMaxAge
          },
          app
        )
  );

  // install a corsMiddleware
  app.use(corsMiddleware);

  // default ctx.request.body (koa-bodyparser)
  app.use(bodyParserMiddleware);

  app.handler = () => {
    trace("start lambda");
    return LambdaHandler({ app });
  };

  app.serve = (err, cb) => {
    trace(options, "start server");
    return ServerApp({ app, port, logger });
  };

  // the run function selects between serve and handler.
  app.run = function(isLambdaOverride = false) {
    trace("run");
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
