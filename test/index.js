// drop in replacement for `koa`.
import App from "..";

// import your koa middleware.
import serve from "koa-static";

// create your application.
var app = new App();

// add your own middleware
app.use(serve("./public"));

// run program as daemon or export handler for lambda.
export const handler = app.run();
