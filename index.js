"use strict";

import koa from "koa";
import responseTime from "koa-response-time";
import session from "koa-session";
import bodyParser from "koa-bodyparser";
import cors from "kcors";
import helmet from "koa-helmet";
import error from "koa-error";
import roarr from "roarr";
import defaultLogMiddleware from "./logger";
import isLambda from "is-lambda";
import lambdaMiddleware from "./lambdaWorkaround";

const isNotBlank = o => {
  return typeof o !== "undefined";
};

function KoaServerlessReady({
  log = roarr,
  logger = roarr.child({ isLambda }),
  cookieName = "session",
  cookieMaxAge = 30 * 24 * 60 * 60 * 1000, // 30 days
  beforeMiddlewares = [],
  middlewares = [],
  sessionMiddleware,
  bodyParserMiddleware,
  errorMiddleware,
  securityMiddleware,
  corsMiddleware,
  loggerMiddleware
}) {
  let options = {
    log,
    logger,
    cookieName,
    cookieMaxAge,
    beforeMiddlewares,
    middlewares,
    sessionMiddleware,
    bodyParserMiddleware,
    errorMiddleware,
    securityMiddleware,
    corsMiddleware,
    loggerMiddleware
  };

  // Initialize your koa-application.
  let app = new koa();

  // Add sensible error handling.
  app.on("error", (err, ctx) => {
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
  });

  beforeMiddlewares.map(m => app.use(m));

  // handle requests from lambda
  if (isLambda) {
    app.use(lambdaMiddleware);
  }

  // logger
  app.use(defaultLogMiddleware({ log }));

  // Add X-Response-Time header
  app.use(responseTime());

  // Enhance error handling.
  app.use(isNotBlank(errorMiddleware) ? errorMiddleware : error());

  // register secure headers.
  app.use(isNotBlank(securityMiddleware) ? securityMiddleware : helmet());

  // initialize user session via cookie
  app.keys = [process.env.SESSION_KEY];
  app.use(
    isNotBlank(sessionMiddleware)
      ? sessionMiddleware
      : session(
          {
            key: cookieName,
            maxAge: cookieMaxAge
          },
          app
        )
  );

  app.use(
    isNotBlank(corsMiddleware)
      ? corsMiddleware
      : cors({
          origin: process.env.CORS_ORIGIN
        })
  );

  // assigns value to ctx.request.body
  app.use(
    isNotBlank(bodyParserMiddleware) ? bodyParserMiddleware : bodyParser()
  );

  middlewares.map(m => app.use(m));

  app.options = options;
  app.run = function() {
    const logger = log.child({ isLambda });
    const { info } = logger;
    const serverlessApp = KoaServerlessReady(
      Object.assign({ isLambda, app }, options)
    );

    if (isLambda) {
      var LambdaHandler = require("./lambda").default;
      info("start lambda");
      return LambdaHandler({ app });
    } else {
      var ServerApp = require("./server").default;
      let { port = 1234 } = options;
      info({ port }, "start server");
      return ServerApp({ app, port, logger });
    }
  };

  return app;
}

export default KoaServerlessReady;
