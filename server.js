export default function ServerApp(options, listenCallback) {
  const { app, port, logger } = options;

  function defaultListenCallback(err, result) {
    if (err) {
      logger.fatal("ERROR: " + err);
    }

    logger.info({ port, NODE_ENV: process.env.NODE_ENV }, "Listening on port");
  }

  app.listen(port, listenCallback || defaultListenCallback);
}
