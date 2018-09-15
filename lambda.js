import awsServerless from "aws-serverless-express";

export default function LambdaHandler({ app }) {
  app.proxy = true;
  const server = awsServerless.createServer(app.callback());
  return (event, context) => awsServerless.proxy(server, event, context);
}
