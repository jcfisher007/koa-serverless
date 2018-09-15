export default (err, ctx) => {
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
