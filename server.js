export default function ServerApp(options) {
  const { app, port, logger } = options;

  app.listen(port, function(err, result) {
    if (err) {
      logger.fatal("ERROR: " + err);
    }

    logger.info(
      { NODE_ENV: process.env.NODE_ENV },
      "Listening on port: " + port
    );
  });
}
