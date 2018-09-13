import awsServerless from "aws-serverless-express";

export default function LambdaHandler({ isLambda = true, app }) {
  app.proxy = true;
  const server = awsServerless.createServer(App({ isLambda }).callback());
  return (event, context) => awsServerless.proxy(server, event, context);
}
