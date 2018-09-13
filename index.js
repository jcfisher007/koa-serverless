"use strict";

import koa from "koa";
import responseTime from "koa-response-time";
import session from "koa-session";
import bodyParser from "koa-bodyparser";
import cors from "kcors";
import helmet from "koa-helmet";
import error from "koa-error";
import roarr from "roarr";
import logger from "./logger";
import lambdaMiddleware from "./lambda";

export function KoaServerlessReady({
  log = roarr,
  cookieName = "session",
  cookieMaxAge = 30 * 24 * 60 * 60 * 1000, // 30 days
  isLambda = false,
  beforeMiddlewares = [],
  middlewares = [],
  sessionMiddleware,
  bodyParserMiddleware,
  errorMiddleware,
  securityMiddleware,
  corsMiddleware,
  loggerMiddleware
}) {
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
  app.use(loggerMiddleware ? loggerMiddleware : logger({ log }));

  // Add X-Response-Time header
  app.use(responseTime());

  // Enhance error handling.
  app.use(errorMiddleware ? errorMiddleware : error());

  // register secure headers.
  app.use(securityMiddleware ? securityMiddleware : helmet());

  // assigns value to ctx.request.body
  app.use(bodyParserMiddleware ? bodyParserMiddleware : bodyParser());

  // initialize user session via cookie
  app.keys = [process.env.SESSION_KEY];
  app.use(
    sessionMiddleware
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
    corsMiddleware
      ? corsMiddleware
      : cors({
          origin: process.env.CORS_ORIGIN
        })
  );

  middlewares.map(m => app.use(m));

  return app;
}

export function run(options = {}) {
  const isLambda = require("is-lambda");
  const log = require("roarr").default;
  const logger = log.child({ isLambda });
  const app = KoaServerlessReady(Object.assign({ isLambda, log }, options));

  if (isLambda) {
    var Handler = require("./lambda").default;
    logger.info("start lambda");
    exports.handler = LambdaHandler(app);
  } else {
    var ServerApp = require("./server").default;
    const port = process.env.PORT || 1234;
    ServerApp({ app, port });
  }
}

export default options => run(options);
