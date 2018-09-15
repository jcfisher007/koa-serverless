// drop in replacement for `koa`.
var App = require("../dist/");
var app = new App();

// add your own middleware
var serve = require("koa-static");
app.use(serve("./public"));

// run program as daemon or export handler for lambda.
exports.handler = app.run(/* isLambdaOverride */);
