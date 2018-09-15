"use strict";

import koa from "koa";
import responseTime from "koa-response-time";
import session from "koa-session";
import bodyParser from "koa-bodyparser";
import cors from "kcors";
import helmet from "koa-helmet";
import error from "koa-error";
import roarr from "roarr";
import defaultErrorHandler from "./error";
import defaultLogMiddleware from "./logger";
import isLambda from "is-lambda";
import lambdaWorkaroundMiddleware from "./lambdaWorkaround";

function KoaServerlessApp({
  port = process.env.PORT || 1234,
  log = roarr,
  logger = roarr.child({ isLambda }),
  sessionKeys = [process.env.SESSION_KEY],
  cookieName = "session",
  cookieMaxAge = 30 * 24 * 60 * 60 * 1000, // 30 days
  middlewares = [],
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
    log,
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

  trace("add sensible error handling");

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

  // Add X-Response-Time header
  app.use(timerMiddleware);

  // Enhance error handling.
  app.use(errorMiddleware);

  // register secure headers.
  app.use(securityMiddleware);

  // initialize user session via cookie
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

  app.use(corsMiddleware);

  // assigns value to ctx.request.body
  app.use(bodyParserMiddleware);

  trace("register custom middleware");

  middlewares.map(m => app.use(m));

  app.options = options;

  app.handler = () => {
    var LambdaHandler = require("./lambda").default;
    trace("start lambda");
    return LambdaHandler({ app });
  };

  app.serve = (err, cb) => {
    var ServerApp = require("./server").default;
    trace(options, "start server");
    return ServerApp({ app, port, logger });
  };

  // the run fun
  app.run = function(isLambdaOverride = false) {
    trace("run");
    if (isLambdaOverride || isLambda) {
      return app.handler();
    } else {
      return app.serve();
    }
  };

  afterHook(app);

  return app;
}

export default KoaServerlessApp;
