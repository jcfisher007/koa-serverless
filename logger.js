import uuidv4 from "uuid/v4";

const logger = ({ log }) => async (ctx, next) => {
  const { request, response } = ctx;
  const requestId = ctx.request.headers["x-request-id"] || `s-${uuidv4()}`;
  ctx.log = log.child({ requestId });
  await next();
  ctx.log.info({ request, response }, "request complete");
};

export default logger;
